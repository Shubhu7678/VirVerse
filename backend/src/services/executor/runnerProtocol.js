import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const MAX_NONCES = 50_000;
const NONCE_TTL_MS = 60_000;
const usedNonces = new Map();

function signatureFor(secret, timestamp, nonce, body) {
  const digest = createHash('sha256').update(body).digest('hex');
  return createHmac('sha256', secret).update(`${timestamp}\n${nonce}\n${digest}`).digest('hex');
}

export function signRunnerRequest(secret, timestamp, nonce, body) {
  return signatureFor(secret, timestamp, nonce, body);
}

export function verifyRunnerRequest({ secret, timestamp, nonce, body, signature, now = Date.now() }) {
  if (!secret || !timestamp || !nonce || !signature) return false;
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > 30_000) return false;
  if (!/^[a-f0-9-]{16,80}$/i.test(nonce) || !/^[a-f0-9]{64}$/i.test(signature)) return false;

  for (const [value, expiresAt] of usedNonces) {
    if (expiresAt <= now) usedNonces.delete(value);
  }
  if (usedNonces.has(nonce) || usedNonces.size >= MAX_NONCES) return false;

  const expected = Buffer.from(signatureFor(secret, timestamp, nonce, body), 'hex');
  const supplied = Buffer.from(signature, 'hex');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  usedNonces.set(nonce, now + NONCE_TTL_MS);
  return true;
}

export function clearRunnerNoncesForTests() {
  usedNonces.clear();
}
