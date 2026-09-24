/**
 * lib/format-converter.ts
 *
 * Convert content between HTML, Markdown, and JSON using the `unified`
 * ecosystem (remark/rehype). JSON here means a "mdast" syntax tree — a
 * fully JSON-serializable, structured representation of the document
 * (headings, paragraphs, lists, links, etc.) rather than a flat string.
 * This makes it a genuinely useful intermediate format (e.g. for storing
 * rich content in a database and rendering it to HTML or Markdown later).
 *
 * ---------------------------------------------------------------------
 * INSTALL (run in your Next.js 16 project root):
 *
 *   npm install unified remark-parse remark-gfm remark-rehype \
 *     remark-stringify rehype-parse rehype-remark rehype-stringify \
 *     rehype-sanitize
 *
 * All packages are ESM and ship their own TypeScript types, so no
 * @types packages are needed. They work fine in Next.js 16's Node.js
 * runtime (Server Components, Route Handlers, Server Actions). If you
 * plan to run this on the Edge runtime, test it there first — some
 * rehype plugins assume Node's Buffer under the hood.
 * ---------------------------------------------------------------------
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import type { Root as MdastRoot } from 'mdast';

export type DataFormat = 'html' | 'markdown' | 'json';

/** The "json" format: a JSON-serializable Markdown syntax tree (mdast). */
export type JsonDoc = MdastRoot;

/* ------------------------------------------------------------------ */
/*  Markdown <-> HTML                                                  */
/* ------------------------------------------------------------------ */

/**
 * Convert Markdown (GitHub-flavored: tables, strikethrough, etc.) to HTML.
 * Sanitizes the output HTML by default to strip unsafe tags/attributes
 * (e.g. <script>, onclick=...). Pass { sanitize: false } to disable this
 * only if you fully trust the input.
 */
export async function markdownToHtml(
  markdown: string,
  opts: { sanitize?: boolean } = {}
): Promise<string> {
  let processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
  if (opts.sanitize !== false) {
    processor = processor.use(rehypeSanitize);
  }
  const file = await processor.use(rehypeStringify).process(markdown);
  return String(file);
}

/** Convert an HTML string (fragment or full document) to GFM Markdown. */
export async function htmlToMarkdown(html: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(html);
  return String(file);
}

/* ------------------------------------------------------------------ */
/*  Markdown <-> JSON                                                  */
/* ------------------------------------------------------------------ */

/** Parse Markdown into a JSON-serializable syntax tree (mdast). */
export function markdownToJson(markdown: string): JsonDoc {
  return unified().use(remarkParse).use(remarkGfm).parse(markdown) as JsonDoc;
}

/** Serialize a JSON syntax tree (mdast) back into Markdown text. */
export function jsonToMarkdown(json: JsonDoc): string {
  return unified().use(remarkGfm).use(remarkStringify).stringify(json);
}

/* ------------------------------------------------------------------ */
/*  HTML <-> JSON                                                      */
/*  (routed through Markdown, so all three formats stay consistent)    */
/* ------------------------------------------------------------------ */

/** Parse HTML into a JSON syntax tree (mdast). */
export async function htmlToJson(html: string): Promise<JsonDoc> {
  const markdown = await htmlToMarkdown(html);
  return markdownToJson(markdown);
}

/** Serialize a JSON syntax tree (mdast) into HTML. */
export async function jsonToHtml(
  json: JsonDoc,
  opts: { sanitize?: boolean } = {}
): Promise<string> {
  const markdown = jsonToMarkdown(json);
  return markdownToHtml(markdown, opts);
}

/* ------------------------------------------------------------------ */
/*  Generic dispatcher                                                 */
/* ------------------------------------------------------------------ */

/**
 * Convert `input` from one format to another.
 * - When `to` is "json", the result is a JSON *string* (use JSON.parse
 *   on it, or call the typed functions above directly if you want the
 *   object rather than a string).
 * - When `from` is "json", `input` must be a JSON string of a JsonDoc.
 */
export async function convert(
  input: string,
  from: DataFormat,
  to: DataFormat
): Promise<string> {
  if (from === to) return input;

  const key = `${from}->${to}`;
  switch (key) {
    case 'markdown->html':
      return markdownToHtml(input);
    case 'html->markdown':
      return htmlToMarkdown(input);
    case 'markdown->json':
      return JSON.stringify(markdownToJson(input), null, 2);
    case 'json->markdown':
      return jsonToMarkdown(JSON.parse(input) as JsonDoc);
    case 'html->json':
      return JSON.stringify(await htmlToJson(input), null, 2);
    case 'json->html':
      return jsonToHtml(JSON.parse(input) as JsonDoc);
    default:
      throw new Error(`Unsupported conversion: ${key}`);
  }
}

/*
USAGE EXAMPLES
*************************************

Why "JSON" isn't just a string wrapper

I used a real Markdown syntax tree (mdast) as the JSON format instead of something like { content: "..." }. That gives you a structured, JSON-serializable document — headings, paragraphs, lists, links as actual nested objects — which is genuinely more useful if you're storing rich content in a database and rendering it different ways later. HTML routes through Markdown internally so all three formats stay consistent with each other.

How to use it

Server Component / Route Handler / Server Action (these run on Node, so call directly):

ts
import { markdownToHtml, htmlToMarkdown, markdownToJson, convert } from '@/lib/format-converter';

const html = await markdownToHtml('# Hello\n\nSome **bold** text.');
const md = await htmlToMarkdown('<h1>Hello</h1><p>Some <strong>bold</strong> text.</p>');
const json = markdownToJson('# Hello'); // sync, returns the mdast object directly
const jsonString = await convert('# Hello', 'markdown', 'json'); // generic form

Route Handler example (app/api/convert/route.ts):

ts
import { NextRequest, NextResponse } from 'next/server';
import { convert, DataFormat } from '@/lib/format-converter';

export async function POST(req: NextRequest) {
  const { input, from, to } = await req.json() as { input: string; from: DataFormat; to: DataFormat };
  const result = await convert(input, from, to);
  return NextResponse.json({ result });
}

Client Component — call it via the API route above (or a Server Action), since these packages should run server-side, not bundled into client JS:

ts
'use client';
async function handleConvert(markdown: string) {
  const res = await fetch('/api/convert', {
    method: 'POST',
    body: JSON.stringify({ input: markdown, from: 'markdown', to: 'html' }),
  });
  const { result } = await res.json();
  return result;
}

A few notes worth knowing:

markdownToHtml sanitizes output by default (strips <script>, onclick=, etc.) — pass { sanitize: false } only if you fully trust the input.
GFM (tables, strikethrough, task lists) is enabled by default via remark-gfm.
markdownToJson / jsonToMarkdown are synchronous; the HTML-involving functions are async since parsing/stringifying HTML uses async unified plugins
 */