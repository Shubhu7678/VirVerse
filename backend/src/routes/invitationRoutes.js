import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Membership from '../models/OrganizationMembership.js';
import Invitation from '../models/OrganizationInvitation.js';
import OrganizationSubscription from '../models/OrganizationSubscription.js';
import { findValidInvitation } from '../services/invitation.js';
import { COOKIE_NAME, setAuthCookie } from '../utils/token.js';
import protect from '../middleware/auth.js';

const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});
router.use(limiter);

async function hasAvailableSeat(invitation) {
  if (!['teacher', 'student'].includes(invitation.role)) return true;
  const subscription = await OrganizationSubscription.findOne({
    organization: invitation.organization._id,
  }).lean();
  if (!subscription) return false;
  const now = new Date();
  const active = subscription.status === 'active'
    && (!subscription.endsAt || subscription.endsAt > now);
  const trial = subscription.status === 'trial'
    && subscription.trialEndsAt > now;
  if (!active && !trial) return false;

  const [members, maximum] = await Promise.all([
    Membership.countDocuments({
      organization: invitation.organization._id,
      role: invitation.role,
      status: 'active',
    }),
    Promise.resolve(invitation.role === 'student' ? subscription.studentSeats : subscription.teacherSeats),
  ]);
  return members < maximum;
}

// Authenticated invitation inbox. The recipient is derived from the session,
// never from a caller-supplied email address.
router.get('/mine', protect, async (req, res) => {
  const invitations = await Invitation.find({
    email: req.user.email,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .populate({
      path: 'organization',
      select: 'name slug status',
      match: { status: 'active' },
    })
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    invitations: invitations
      .filter((invitation) => invitation.organization)
      .map(({ _id, organization, role, expiresAt, createdAt }) => ({
        id: _id,
        organization,
        role,
        expiresAt,
        createdAt,
      })),
  });
});

// Accepting from the inbox requires a signed-in account matching the invited
// email. This lets existing users accept without recovering the raw token.
router.post('/:id/accept', protect, async (req, res) => {
  const invitation = await Invitation.findOne({
    _id: req.params.id,
    email: req.user.email,
    acceptedAt: null,
    expiresAt: { $gt: new Date() },
  }).populate('organization', 'status');

  if (!invitation || invitation.organization?.status !== 'active') {
    return res.status(404).json({ message: 'Invitation is invalid or has expired' });
  }
  if (!await hasAvailableSeat(invitation)) {
    return res.status(409).json({ message: 'Organization seat limit reached or subscription is inactive' });
  }

  const claimed = await Invitation.findOneAndUpdate(
    {
      _id: invitation._id,
      email: req.user.email,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { acceptedAt: new Date() },
    { returnDocument: 'after' }
  );
  if (!claimed) return res.status(404).json({ message: 'Invitation is invalid or has expired' });

  await Membership.updateOne(
    { user: req.user._id, organization: invitation.organization._id },
    { $set: { role: invitation.role, status: 'active' } },
    { upsert: true }
  );

  res.json({
    message: 'Invitation accepted',
    organizationId: invitation.organization._id,
    role: invitation.role,
  });
});

// Public: shows who the invite is for. Returns nothing useful for bad tokens.
router.get('/preview', async (req, res) => {
  const inv = await findValidInvitation(req.query.token);
  if (!inv || inv.organization?.status === 'suspended') {
    return res.status(404).json({ message: 'Invitation is invalid or has expired' });
  }
  const existing = await User.exists({ email: inv.email });
  res.json({ email: inv.email, role: inv.role, organization: inv.organization.name, existingAccount: !!existing });
});

router.post('/accept', async (req, res) => {
  const { token, name, password } = req.body;
  const inv = await findValidInvitation(token);
  if (!inv) return res.status(404).json({ message: 'Invitation is invalid or has expired' });
  if (inv.organization?.status !== 'active') {
    return res.status(403).json({ message: 'Organization is not active' });
  }

  let user = await User.findOne({ email: inv.email });
  if (user) {
    // An existing account must prove ownership by being signed in as that user.
    let sessionId = null;
    try { sessionId = jwt.verify(req.cookies?.[COOKIE_NAME], process.env.JWT_SECRET).id; } catch { /* not signed in */ }
    if (String(sessionId) !== String(user._id)) {
      return res.status(401).json({ message: 'Sign in with the invited email first, then open the link again' });
    }
  } else {
    if (typeof name !== 'string' || !name.trim() || name.length > 80) return res.status(400).json({ message: 'Name is required' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  if (!await hasAvailableSeat(inv)) {
    return res.status(409).json({ message: 'Organization seat limit reached or subscription is inactive' });
  }

  // Single-use: only one request can flip acceptedAt from null.
  const claimed = await Invitation.findOneAndUpdate(
    { _id: inv._id, acceptedAt: null }, { acceptedAt: new Date() }
  );
  if (!claimed) return res.status(404).json({ message: 'Invitation is invalid or has expired' });

  if (!user) user = await User.create({ name: name.trim(), email: inv.email, password });
  await Membership.updateOne(
    { user: user._id, organization: inv.organization._id },
    { $set: { role: inv.role, status: 'active' } },
    { upsert: true }
  );
  setAuthCookie(res, user._id);
  res.status(201).json({ user: user.toSafeObject(), organizationId: inv.organization._id });
});

export default router;
