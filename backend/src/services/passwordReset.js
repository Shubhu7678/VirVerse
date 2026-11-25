import { createHash, randomBytes } from 'node:crypto';
import User from '../models/User.js';

export const RESET_TTL_MS = 60 * 60 * 1000;

export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

// The raw token only ever goes in the emailed link. The database keeps its SHA-256 hash.
export function createResetToken(now = Date.now()) {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashToken(token), expiresAt: new Date(now + RESET_TTL_MS) };
}

export const isResetValid = (user, token, now = Date.now()) =>
  Boolean(user?.passwordResetHash)
  && user.passwordResetHash === hashToken(String(token))
  && user.passwordResetExpiresAt instanceof Date
  && user.passwordResetExpiresAt.getTime() > now;

export async function findUserByResetToken(token) {
  if (typeof token !== 'string' || token.length < 32) return null;
  const user = await User.findOne({
    passwordResetHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+password +passwordResetHash +passwordResetExpiresAt');
  return user && isResetValid(user, token) ? user : null;
}

// Stores a fresh token on the user (replacing any earlier one) and returns the link to send.
export async function issueResetLink(user) {
  const { token, hash, expiresAt } = createResetToken();
  await User.updateOne({ _id: user._id }, { passwordResetHash: hash, passwordResetExpiresAt: expiresAt });
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return { link: `${base}/reset-password?token=${token}`, expiresAt };
}
