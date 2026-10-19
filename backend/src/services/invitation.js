import crypto from 'node:crypto';
import Invitation from '../models/OrganizationInvitation.js';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

export async function createInvitation({ organization, email, role, invitedBy }) {
  const token = crypto.randomBytes(32).toString('base64url');
  await Invitation.create({
    organization, email, role, invitedBy,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });
  const base = process.env.CLIENT_URL || 'http://localhost:5173';
  return { link: `${base}/accept-invite?token=${token}`, expiresInDays: 7 };
}

export async function findValidInvitation(token) {
  if (typeof token !== 'string' || token.length < 20) return null;
  return Invitation.findOne({
    tokenHash: hashToken(token), acceptedAt: null, expiresAt: { $gt: new Date() },
  }).populate('organization', 'name status');
}
