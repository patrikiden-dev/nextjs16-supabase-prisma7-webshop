// lib/slugify.ts

export function slugify(title: string): string {
    return title
        .normalize('NFKD')                  // split accented chars into base + diacritic
        .replace(/[\u0300-\u036f]/g, '')    // strip diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')       // remove non-alphanumeric chars
        .replace(/[\s_-]+/g, '-')           // collapse whitespace/underscores/dashes into one dash
        .replace(/^-+|-+$/g, '');           // trim leading/trailing dashes
}
/*
USAGE Examples
********************************
normalize('NFKD') + stripping combining marks handles accented characters (é, ñ, etc.) gracefully instead of just
deleting them.
If you need uniqueness (e.g., two posts titled "Hello World"), you'll want to check the generated slug against
existing ones in your database and append a suffix (-2, -3, etc.) if there's a collision — that logic lives wherever
you're creating the blog post, not in the slugify function itself.
If you're using this in a Server Action or Route Handler to create posts, just import it: import { slugify }
from '@/lib/slugify'

slugify("Hello, World! This is Next.js 16 🚀");
// -> "hello-world-this-is-nextjs-16"

slugify("Café con leche: My Trip to México");
// -> "cafe-con-leche-my-trip-to-mexico"


 */