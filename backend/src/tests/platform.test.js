import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const uri = process.env.TEST_MONGO_URI_PLATFORM || 'mongodb://127.0.0.1:27018/virvese-test-platform';

const { default: authRoutes } = await import('../routes/authRoutes.js');
const { default: platformRoutes } = await import('../routes/platformRoutes.js');
const { default: invitationRoutes } = await import('../routes/invitationRoutes.js');
const { default: User } = await import('../models/User.js');
const { default: Invitation } = await import('../models/OrganizationInvitation.js');
const { default: Membership } = await import('../models/OrganizationMembership.js');
const { default: AuditLog } = await import('../models/AuditLog.js');
const { seedPlatformData } = await import('../services/bootstrapData.js');

let server, base, orgId;
const cookies = {};

async function call(method, path, { user, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(user ? { cookie: cookies[user] } : {}) },
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
}
async function signup(name) {
  const r = await call('POST', '/api/auth/signup', { body: { name, email: `${name}@t.io`, password: 'password1' } });
  cookies[name] = r.headers.get('set-cookie').split(';')[0];
}
const tokenOf = (link) => new URL(link).searchParams.get('token');

before(async () => {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  await seedPlatformData();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/platform', platformRoutes);
  app.use('/api/invitations', invitationRoutes);
  server = http.createServer(app).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  await signup('root');
  await signup('rando');
  await User.updateOne({ email: 'root@t.io' }, { platformRole: 'super_admin' });
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test('seed is idempotent and plans have no prices', async () => {
  await seedPlatformData();
  const r = await call('GET', '/api/platform/plans', { user: 'root' });
  assert.deepEqual(r.body.plans.map((p) => p.key).sort(), ['premium', 'standard', 'trial']);
  assert.ok(r.body.plans.every((p) => p.price === undefined));
});

test('non super admins cannot use platform APIs', async () => {
  for (const [m, p] of [['GET', '/stats'], ['POST', '/organizations'], ['GET', '/audit-logs']]) {
    assert.equal((await call(m, '/api/platform' + p, { user: 'rando', body: {} })).status, 403);
  }
});

test('create organization with trial and admin invitation', async () => {
  const bad = await call('POST', '/api/platform/organizations', { user: 'root', body: { name: 'X', slug: 'Bad Slug' } });
  assert.equal(bad.status, 400);
  const r = await call('POST', '/api/platform/organizations', {
    user: 'root', body: { name: 'Acme College', slug: 'acme', adminEmail: 'dean@acme.edu', planKey: 'trial' },
  });
  assert.equal(r.status, 201);
  orgId = r.body.organization._id;
  assert.ok(r.body.invitation.link.includes('/accept-invite?token='));
  const dup = await call('POST', '/api/platform/organizations', { user: 'root', body: { name: 'Acme 2', slug: 'acme' } });
  assert.equal(dup.status, 409);
  const list = await call('GET', '/api/platform/organizations', { user: 'root' });
  const acme = list.body.items[0];
  assert.equal(acme.subscription.status, 'trial');
  assert.ok(acme.subscription.trialEndsAt);
  assert.equal(acme.studentSeats, undefined);
  assert.equal(acme.studentCount, 0);
  assert.ok(await AuditLog.exists({ action: 'organization.create' }));
});

test('invitation token is stored hashed, single-use, and creates the admin', async () => {
  const created = await call('POST', `/api/platform/organizations/${orgId}/invitations`, { user: 'root', body: { email: 'prof@acme.edu' } });
  const token = tokenOf(created.body.invitation.link);
  const stored = await Invitation.findOne({ email: 'prof@acme.edu' });
  assert.notEqual(stored.tokenHash, token);
  assert.equal(await Invitation.countDocuments({ tokenHash: token }), 0);

  assert.equal((await call('GET', `/api/invitations/preview?token=${token}`)).body.organization, 'Acme College');
  assert.equal((await call('GET', '/api/invitations/preview?token=nope-nope-nope-nope-nope')).status, 404);
  assert.equal((await call('POST', '/api/invitations/accept', { body: { token, name: 'Prof', password: 'short' } })).status, 400);

  const ok = await call('POST', '/api/invitations/accept', { body: { token, name: 'Prof', password: 'password1' } });
  assert.equal(ok.status, 201);
  const user = await User.findOne({ email: 'prof@acme.edu' });
  const m = await Membership.findOne({ user: user._id, organization: orgId });
  assert.equal(m.role, 'org_admin');
  assert.equal((await call('POST', '/api/invitations/accept', { body: { token, name: 'Again', password: 'password1' } })).status, 404);
});

test('expired invitations and existing-account takeover are rejected', async () => {
  const c = await call('POST', `/api/platform/organizations/${orgId}/invitations`, { user: 'root', body: { email: 'late@acme.edu' } });
  const token = tokenOf(c.body.invitation.link);
  await Invitation.updateOne({ email: 'late@acme.edu' }, { expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await call('POST', '/api/invitations/accept', { body: { token, name: 'L', password: 'password1' } })).status, 404);

  const t2 = tokenOf((await call('POST', `/api/platform/organizations/${orgId}/invitations`, { user: 'root', body: { email: 'rando@t.io' } })).body.invitation.link);
  const anon = await call('POST', '/api/invitations/accept', { body: { token: t2, name: 'x', password: 'password1' } });
  assert.equal(anon.status, 401);
  assert.equal((await call('POST', '/api/invitations/accept', { user: 'rando', body: { token: t2 } })).status, 201);
});

test('signed-in recipients can see and accept only their own invitations', async () => {
  const created = await call('POST', `/api/platform/organizations/${orgId}/invitations`, {
    user: 'root',
    body: { email: 'rando@t.io' },
  });
  assert.equal(created.status, 201);

  const recipientInbox = await call('GET', '/api/invitations/mine', { user: 'rando' });
  assert.equal(recipientInbox.status, 200);
  assert.equal(recipientInbox.body.invitations.length, 1);
  assert.equal(recipientInbox.body.invitations[0].organization.name, 'Acme College');
  assert.equal(recipientInbox.body.invitations[0].role, 'org_admin');
  assert.equal(recipientInbox.body.invitations[0].tokenHash, undefined);

  const otherInbox = await call('GET', '/api/invitations/mine', { user: 'root' });
  assert.equal(otherInbox.body.invitations.length, 0);

  const invitationId = recipientInbox.body.invitations[0].id;
  assert.equal((await call('POST', `/api/invitations/${invitationId}/accept`, { user: 'root' })).status, 404);
  const accepted = await call('POST', `/api/invitations/${invitationId}/accept`, { user: 'rando' });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.role, 'org_admin');
  assert.equal(await Invitation.countDocuments({ _id: invitationId, acceptedAt: null }), 0);
  assert.ok(await Membership.exists({
    user: await User.findOne({ email: 'rando@t.io' }).then((u) => u._id),
    organization: orgId,
    role: 'org_admin',
  }));
  assert.equal((await call('GET', '/api/invitations/mine', { user: 'rando' })).body.invitations.length, 0);
  assert.equal((await call('POST', `/api/invitations/${invitationId}/accept`, { user: 'rando' })).status, 404);
});

test('suspend, extend trial and seat limits', async () => {
  const s = await call('POST', `/api/platform/organizations/${orgId}/status`, { user: 'root', body: { status: 'suspended' } });
  assert.equal(s.body.organization.status, 'suspended');
  assert.equal((await call('POST', `/api/platform/organizations/${orgId}/status`, { user: 'root', body: { status: 'bogus' } })).status, 400);
  const before = (await call('GET', '/api/platform/organizations', { user: 'root' })).body.items[0].subscription.trialEndsAt;
  const u = await call('PUT', `/api/platform/organizations/${orgId}/subscription`, { user: 'root', body: { extendTrialDays: 10, studentSeats: 99 } });
  assert.equal(u.body.subscription.studentSeats, 99);
  assert.equal(Math.round((new Date(u.body.subscription.trialEndsAt) - new Date(before)) / 86400000), 10);
  assert.equal((await call('PUT', `/api/platform/organizations/${orgId}/subscription`, { user: 'root', body: { studentSeats: -1 } })).status, 400);
});

test('stats are real and revenue is null', async () => {
  const r = await call('GET', '/api/platform/stats', { user: 'root' });
  assert.equal(r.body.organizations.total, 1);
  assert.equal(r.body.organizations.suspended, 1);
  assert.equal(r.body.subscriptions.trial, 1);
  assert.equal(r.body.revenue, null);
});
