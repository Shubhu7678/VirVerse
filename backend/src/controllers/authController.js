import { randomBytes, randomUUID } from 'node:crypto';
import User from '../models/User.js';
import Membership from '../models/OrganizationMembership.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';

const DEMO_SESSION_MS = 24 * 60 * 60 * 1000;

export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    return res
      .status(409)
      .json({ message: 'Email already registered', errors: { email: 'Email already registered' } });
  }

  const user = await User.create({ name, email, password });
  setAuthCookie(res, user._id);
  res.status(201).json({ user: user.toSafeObject() });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.isDemo || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  setAuthCookie(res, user._id);
  res.json({ user: user.toSafeObject() });
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export async function me(req, res) {
  const memberships = await Membership.find({ user: req.user._id, status: 'active' })
    .populate('organization', 'name slug status')
    .lean();
  res.json({
    user: req.user.toSafeObject(),
    memberships: memberships
      .filter((m) => m.organization)
      .map((m) => ({ organization: m.organization, role: m.role })),
  });
}

export async function startDemoSession(_req, res) {
  const demoExpiresAt = new Date(Date.now() + DEMO_SESSION_MS);
  const user = await User.create({
    name: 'Demo Learner',
    email: `demo-${randomUUID()}@demo.virverse.invalid`,
    password: randomBytes(32).toString('hex'),
    isDemo: true,
    demoExpiresAt,
  });

  setAuthCookie(res, user._id, {
    maxAge: DEMO_SESSION_MS,
    expiresIn: Math.floor(DEMO_SESSION_MS / 1000),
  });
  res.set('Cache-Control', 'no-store');
  res.status(201).json({ user: user.toSafeObject() });
}
