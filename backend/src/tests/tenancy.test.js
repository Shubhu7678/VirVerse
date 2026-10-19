import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const uri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27018/virvese-test';

const { default: authRoutes } = await import('../routes/authRoutes.js');
const { default: orgRoutes } = await import('../routes/orgRoutes.js');
const { default: platformRoutes } = await import('../routes/platformRoutes.js');
const { default: User } = await import('../models/User.js');
const { default: Organization } = await import('../models/Organization.js');
const { default: Membership } = await import('../models/OrganizationMembership.js');
const { default: AuditLog } = await import('../models/AuditLog.js');

let server, base;
const orgs = {};
const cookies = {};

async function call(method, path, { user, org, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(user ? { cookie: cookies[user] } : {}),
      ...(org ? { 'x-org-id': String(org) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function signup(name) {
  const res = await fetch(base + '/api/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, email: `${name}@t.io`, password: 'password1' }),
  });
  cookies[name] = res.headers.get('set-cookie').split(';')[0];
  return User.findOne({ email: `${name}@t.io` });
}

before(async () => {
  await mongoose.connect(uri);
  await mongoose.connection.dropDatabase();
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/orgs', orgRoutes);
  app.use('/api/platform', platformRoutes);
  server = http.createServer(app).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  const [alice, bob, stu, root, plain] = await Promise.all(
    ['alice', 'bob', 'stu', 'root', 'plain'].map(signup)
  );
  orgs.a = await Organization.create({ name: 'A', slug: 'a', status: 'active' });
  orgs.b = await Organization.create({ name: 'B', slug: 'b', status: 'active' });
  orgs.s = await Organization.create({ name: 'S', slug: 's', status: 'suspended' });
  await Membership.create([
    { user: alice._id, organization: orgs.a._id, role: 'org_admin' },
    { user: bob._id, organization: orgs.b._id, role: 'org_admin' },
    { user: stu._id, organization: orgs.a._id, role: 'student' },
    { user: stu._id, organization: orgs.b._id, role: 'teacher' },
    { user: alice._id, organization: orgs.s._id, role: 'org_admin' },
  ]);
  await AuditLog.create([
    { actor: alice._id, organization: orgs.a._id, action: 'a.event' },
    { actor: bob._id, organization: orgs.b._id, action: 'b.event' },
  ]);
  await User.updateOne({ _id: root._id }, { platformRole: 'super_admin' });
  void plain;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

test('signup cannot assign super admin', async () => {
  const res = await fetch(base + '/api/auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'evil', email: 'evil@t.io', password: 'password1', platformRole: 'super_admin' }),
  });
  assert.equal(res.status, 201);
  assert.equal((await User.findOne({ email: 'evil@t.io' })).platformRole, null);
});

test('/auth/me returns memberships and no password', async () => {
  const r = await call('GET', '/api/auth/me', { user: 'stu' });
  assert.equal(r.body.memberships.length, 2);
  assert.equal(r.body.user.password, undefined);
});

test('unauthenticated requests are rejected', async () => {
  assert.equal((await call('GET', '/api/orgs/active', { org: orgs.a._id })).status, 401);
});

test('active org needs a real membership', async () => {
  assert.equal((await call('GET', '/api/orgs/active', { user: 'alice', org: orgs.a._id })).status, 200);
  assert.equal((await call('GET', '/api/orgs/active', { user: 'alice', org: orgs.b._id })).status, 403);
  assert.equal((await call('GET', '/api/orgs/active', { user: 'plain', org: orgs.a._id })).status, 403);
  assert.equal((await call('GET', '/api/orgs/active', { user: 'alice', org: 'bad' })).status, 400);
  assert.equal((await call('GET', '/api/orgs/active', { user: 'alice' })).status, 400);
});

test('suspended organizations are blocked', async () => {
  assert.equal((await call('GET', '/api/orgs/active', { user: 'alice', org: orgs.s._id })).status, 403);
});

test('same user gets role per organization', async () => {
  assert.equal((await call('GET', '/api/orgs/active', { user: 'stu', org: orgs.a._id })).body.role, 'student');
  assert.equal((await call('GET', '/api/orgs/active', { user: 'stu', org: orgs.b._id })).body.role, 'teacher');
});

test('audit logs are scoped to the active organization', async () => {
  const r = await call('GET', '/api/orgs/audit-logs', { user: 'alice', org: orgs.a._id });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.items.map((i) => i.action), ['a.event']);
  assert.equal((await call('GET', '/api/orgs/audit-logs', { user: 'alice', org: orgs.b._id })).status, 403);
});

test('role permissions are enforced', async () => {
  assert.equal((await call('GET', '/api/orgs/audit-logs', { user: 'stu', org: orgs.a._id })).status, 403);
  assert.equal((await call('GET', '/api/orgs/audit-logs', { user: 'stu', org: orgs.b._id })).status, 403);
});

test('platform routes are super admin only', async () => {
  assert.equal((await call('GET', '/api/platform/organizations', { user: 'alice' })).status, 403);
  const r = await call('GET', '/api/platform/organizations', { user: 'root' });
  assert.equal(r.status, 200);
  assert.equal(r.body.total, 3);
});
