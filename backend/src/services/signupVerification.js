import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

export const CODE_TTL_MS = 10 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const MAX_SENDS = 5;

// Six digits, zero padded, from a cryptographic random source.
export const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

// Bound to the email, so a code for one address is useless for another.
export const hashCode = (email, code) => createHash('sha256').update(`${String(email).toLowerCase()}:${code}`).digest('hex');

export function codeMatches(pending, code) {
  if (!pending?.codeHash || !/^\d{6}$/.test(String(code))) return false;
  const a = Buffer.from(pending.codeHash, 'hex');
  const b = Buffer.from(hashCode(pending.email, String(code)), 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export const isExpired = (pending, now = Date.now()) => pending.expiresAt.getTime() <= now;

export const secondsUntilResend = (pending, now = Date.now()) =>
  Math.max(0, Math.ceil((pending.lastSentAt.getTime() + RESEND_COOLDOWN_MS - now) / 1000));
