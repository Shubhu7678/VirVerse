import mongoose from 'mongoose';
import Organization, { ORG_TYPES } from '../models/Organization.js';
import Membership from '../models/OrganizationMembership.js';
import Subscription from '../models/OrganizationSubscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Submission from '../models/Submission.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { audit } from '../services/audit.js';
import { createInvitation } from '../services/invitation.js';

const DAY = 24 * 60 * 60 * 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const page = (q) => ({
  limit: Math.min(Number(q.limit) || 25, 100),
  page: Math.max(Number(q.page) || 1, 1),
});
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bad = (res, message) => res.status(400).json({ message });

function buildSubscription(plan, orgId) {
  const now = new Date();
  return {
    organization: orgId,
    plan: plan.key,
    status: plan.isTrial ? 'trial' : 'active',
    startsAt: now,
    trialEndsAt: plan.isTrial ? new Date(now.getTime() + (plan.durationDays || 30) * DAY) : null,
    endsAt: !plan.isTrial && plan.durationDays ? new Date(now.getTime() + plan.durationDays * DAY) : null,
    studentSeats: plan.studentSeats,
    teacherSeats: plan.teacherSeats,
    features: plan.features,
  };
}

export async function stats(_req, res) {
  const [orgs, subs, students, teachers, submissions, users] = await Promise.all([
    Organization.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Subscription.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Membership.countDocuments({ role: 'student', status: 'active' }),
    Membership.countDocuments({ role: 'teacher', status: 'active' }),
    Submission.countDocuments(),
    User.countDocuments(),
  ]);
  const by = (arr, k) => arr.find((x) => x._id === k)?.n ?? 0;
  res.json({
    organizations: {
      total: orgs.reduce((s, x) => s + x.n, 0),
      active: by(orgs, 'active'),
      suspended: by(orgs, 'suspended'),
      pending: by(orgs, 'pending'),
    },
    subscriptions: { trial: by(subs, 'trial'), paid: by(subs, 'active'), expired: by(subs, 'expired') },
    students,
    teachers,
    users,
    submissions,
    // No billing data exists yet, so no revenue is reported.
    revenue: null,
  });
}

export async function listPlans(_req, res) {
  res.json({ plans: await SubscriptionPlan.find({ active: true }).sort({ isTrial: -1, studentSeats: 1 }).lean() });
}

export async function listOrganizations(req, res) {
  const { limit, page: pg } = page(req.query);
  const filter = {};
  if (req.query.search) {
    const re = new RegExp(escapeRe(String(req.query.search).slice(0, 60)), 'i');
    filter.$or = [{ name: re }, { slug: re }];
  }
  const [orgs, total] = await Promise.all([
    Organization.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * limit).limit(limit).lean(),
    Organization.countDocuments(filter),
  ]);
  const ids = orgs.map((o) => o._id);
  const [subs, counts, members] = await Promise.all([
    Subscription.find({ organization: { $in: ids } }).lean(),
    Membership.aggregate([
      { $match: { organization: { $in: ids }, status: 'active' } },
      { $group: { _id: { o: '$organization', r: '$role' }, n: { $sum: 1 } } },
    ]),
    Membership.find({ organization: { $in: ids }, status: 'active' }, 'user organization').lean(),
  ]);
  const usersByOrg = new Map();
  for (const m of members) {
    const k = String(m.organization);
    if (!usersByOrg.has(k)) usersByOrg.set(k, []);
    usersByOrg.get(k).push(m.user);
  }
  const lastActive = new Map(
    await Promise.all(
      orgs.map(async (o) => {
        const u = usersByOrg.get(String(o._id)) ?? [];
        const last = u.length ? await Submission.findOne({ user: { $in: u } }).select('createdAt').sort({ createdAt: -1 }).lean() : null;
        return [String(o._id), last?.createdAt ?? null];
      })
    )
  );
  const subMap = new Map(subs.map((s) => [String(s.organization), s]));
  const n = (id, role) => counts.find((c) => String(c._id.o) === String(id) && c._id.r === role)?.n ?? 0;
  res.json({
    total, page: pg, limit,
    items: orgs.map((o) => ({
      ...o,
      subscription: subMap.get(String(o._id)) ?? null,
      studentCount: n(o._id, 'student'),
      teacherCount: n(o._id, 'teacher'),
      lastActivity: lastActive.get(String(o._id)),
    })),
  });
}

export async function createOrganization(req, res) {
  const { name, slug, type = 'college', contactEmail = '', planKey = 'trial', adminEmail } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 120) return bad(res, 'Name is required');
  if (typeof slug !== 'string' || !SLUG.test(slug) || slug.length > 60) return bad(res, 'Slug must be lowercase letters, numbers and hyphens');
  if (!ORG_TYPES.includes(type)) return bad(res, 'Invalid organization type');
  if (contactEmail && !EMAIL.test(contactEmail)) return bad(res, 'Invalid contact email');
  if (adminEmail && !EMAIL.test(adminEmail)) return bad(res, 'Invalid admin email');
  const plan = await SubscriptionPlan.findOne({ key: String(planKey), active: true });
  if (!plan) return bad(res, 'Unknown plan');
  if (await Organization.exists({ slug })) return res.status(409).json({ message: 'Slug already in use' });

  const org = await Organization.create({
    name: name.trim(), slug, type, contactEmail, status: 'active', createdBy: req.user._id,
  });
  await Subscription.create(buildSubscription(plan, org._id));
  let invitation = null;
  if (adminEmail) {
    invitation = await createInvitation({ organization: org._id, email: adminEmail, role: 'org_admin', invitedBy: req.user._id });
  }
  await audit(req, 'organization.create', { organization: org._id, targetType: 'Organization', targetId: org._id, metadata: { plan: plan.key } });
  res.status(201).json({ organization: org, invitation });
}

async function loadOrg(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(404).json({ message: 'Organization not found' }); return null; }
  const org = await Organization.findById(req.params.id);
  if (!org) res.status(404).json({ message: 'Organization not found' });
  return org;
}

export async function updateOrganization(req, res) {
  const org = await loadOrg(req, res);
  if (!org) return;
  const { name, type, contactEmail, logoUrl } = req.body;
  if (name !== undefined) { if (typeof name !== 'string' || !name.trim()) return bad(res, 'Invalid name'); org.name = name.trim(); }
  if (type !== undefined) { if (!ORG_TYPES.includes(type)) return bad(res, 'Invalid type'); org.type = type; }
  if (contactEmail !== undefined) { if (contactEmail && !EMAIL.test(contactEmail)) return bad(res, 'Invalid contact email'); org.contactEmail = contactEmail; }
  if (logoUrl !== undefined) { if (typeof logoUrl !== 'string' || (logoUrl && !/^https:\/\//.test(logoUrl))) return bad(res, 'Logo must be an https URL'); org.logoUrl = logoUrl; }
  await org.save();
  await audit(req, 'organization.update', { organization: org._id, targetType: 'Organization', targetId: org._id });
  res.json({ organization: org });
}

export async function setStatus(req, res) {
  const org = await loadOrg(req, res);
  if (!org) return;
  if (!['active', 'suspended'].includes(req.body.status)) return bad(res, 'Status must be active or suspended');
  org.status = req.body.status;
  await org.save();
  await audit(req, `organization.${org.status === 'active' ? 'activate' : 'suspend'}`, { organization: org._id, targetType: 'Organization', targetId: org._id });
  res.json({ organization: org });
}

export async function updateSubscription(req, res) {
  const org = await loadOrg(req, res);
  if (!org) return;
  const { planKey, studentSeats, teacherSeats, extendTrialDays } = req.body;
  let sub = await Subscription.findOne({ organization: org._id });
  if (planKey !== undefined) {
    const plan = await SubscriptionPlan.findOne({ key: String(planKey), active: true });
    if (!plan) return bad(res, 'Unknown plan');
    const fresh = buildSubscription(plan, org._id);
    sub = sub ? Object.assign(sub, fresh) : new Subscription(fresh);
  }
  if (!sub) return bad(res, 'Organization has no subscription; provide planKey');
  for (const [k, v] of [['studentSeats', studentSeats], ['teacherSeats', teacherSeats]]) {
    if (v === undefined) continue;
    if (!Number.isInteger(v) || v < 0 || v > 1_000_000) return bad(res, `Invalid ${k}`);
    sub[k] = v;
  }
  if (extendTrialDays !== undefined) {
    if (!Number.isInteger(extendTrialDays) || extendTrialDays < 1 || extendTrialDays > 365) return bad(res, 'extendTrialDays must be 1-365');
    const from = sub.trialEndsAt && sub.trialEndsAt > new Date() ? sub.trialEndsAt : new Date();
    sub.trialEndsAt = new Date(from.getTime() + extendTrialDays * DAY);
    sub.status = 'trial';
  }
  await sub.save();
  await audit(req, 'subscription.update', { organization: org._id, targetType: 'OrganizationSubscription', targetId: sub._id, metadata: { planKey, studentSeats, teacherSeats, extendTrialDays } });
  res.json({ subscription: sub });
}

export async function inviteAdmin(req, res) {
  const org = await loadOrg(req, res);
  if (!org) return;
  const { email } = req.body;
  if (typeof email !== 'string' || !EMAIL.test(email)) return bad(res, 'Valid email is required');
  const invitation = await createInvitation({ organization: org._id, email, role: 'org_admin', invitedBy: req.user._id });
  await audit(req, 'invitation.create', { organization: org._id, targetType: 'Organization', targetId: org._id, metadata: { role: 'org_admin' } });
  res.status(201).json({ invitation });
}

export async function listAuditLogs(req, res) {
  const { limit, page: pg } = page(req.query);
  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((pg - 1) * limit).limit(limit).populate('actor', 'name email').populate('organization', 'name').lean(),
    AuditLog.countDocuments(),
  ]);
  res.json({ items, total, page: pg, limit });
}
