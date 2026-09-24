import "server-only";
import * as argon2 from 'argon2';

/**
 * Argon2id Password Hashing
 *
 * Usage examples are in the end of code snipped as comments!
 *
 * Important (Next.js-specific): argon2 uses native Node bindings, so it will not run on the Edge runtime.
 * Any route, server action, or middleware that uses it must explicitly opt into the Node.js runtime:
 * export const runtime = 'nodejs';
 */
const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
    if (!plain) {
        throw new Error('Password must not be empty');
    }
    return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
    hash: string,
    plain: string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, plain);
    } catch {
        return false;
    }
}

export function needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, ARGON2_OPTIONS);
}

export async function verifyAndRehashIfNeeded(
    storedHash: string,
    plain: string
): Promise<{ valid: boolean; newHash: string | null }> {
    const valid = await verifyPassword(storedHash, plain);
    if (!valid) {
        return { valid: false, newHash: null };
    }

    if (needsRehash(storedHash)) {
        const newHash = await hashPassword(plain);
        return { valid: true, newHash };
    }

    return { valid: true, newHash: null };
}
/*

Usage examples
===================

Registration (Server Action or Route Handler):
******************************************************************
// app/api/register/route.ts
export const runtime = 'nodejs'; // required — native bindings won't work on Edge

import { hashPassword } from '@/lib/auth/password';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const passwordHash = await hashPassword(password);

  // await sku.user.create({ data: { email, passwordHash } });

  return Response.json({ ok: true });
}

Login, with automatic rehash-on-upgrade:
**************************************************
// app/api/login/route.ts
export const runtime = 'nodejs';

import { verifyAndRehashIfNeeded } from '@/lib/auth/password';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await sku.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { valid, newHash } = await verifyAndRehashIfNeeded(
    user.passwordHash,
    password
  );

  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  if (newHash) {
    // Silently upgrade the stored hash to current parameters
    await sku.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });
  }

  // ... issue session/JWT
  return Response.json({ ok: true });
}
 */