import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog, { ACTIVITY_TYPES } from '../models/ActivityLog.js';
import protect from '../middleware/auth.js';
import { createResetToken, hashToken, isResetValid, RESET_TTL_MS } from '../services/passwordReset.js';
import { sendMail, resetEmail } from '../services/mailer.js';
import EmailLog from '../models/EmailLog.js';
import { startOfToday } from '../controllers/adminController.js';

process.env.JWT_SECRET ??= 'test-secret-test-secret-test-secret';

test('reset tokens are random, stored only as a hash, and expire after an hour', () => {
  const now = Date.now();
  const a = createResetToken(now);
  const b = createResetToken(now);
  assert.notEqual(a.token, b.token);
  assert.notEqual(a.hash, a.token);
  assert.equal(a.hash, hashToken(a.token));
  assert.equal(a.expiresAt.getTime() - now, RESET_TTL_MS);

  const user = { passwordResetHash: a.hash, passwordResetExpiresAt: a.expiresAt };
  assert.equal(isResetValid(user, a.token, now), true);
  assert.equal(isResetValid(user, b.token, now), false, 'a different token must not work');
  assert.equal(isResetValid(user, a.token, now + RESET_TTL_MS + 1), false, 'expired');
  assert.equal(isResetValid({}, a.token, now), false, 'no token issued');
});

test('without SMTP settings a mail is not sent and nothing throws', async () => {
  const saved = { host: process.env.SMTP_HOST, from: process.env.MAIL_FROM, env: process.env.NODE_ENV };
  delete process.env.SMTP_HOST;
  delete process.env.MAIL_FROM;
  process.env.NODE_ENV = 'production';
  const warn = mock.method(console, 'warn', () => {});
  const emailLog = mock.method(EmailLog, 'create', async () => ({}));
  try {
    assert.deepEqual(await sendMail({ to: 'a@example.com', subject: 's', text: 't' }), { sent: false });
    assert.equal(warn.mock.callCount(), 1);
    assert.doesNotMatch(String(warn.mock.calls[0].arguments[0]), /reset-password/, 'production logs must not contain links');
  } finally {
    warn.mock.restore();
    emailLog.mock.restore();
    Object.assign(process.env, { SMTP_HOST: saved.host, MAIL_FROM: saved.from, NODE_ENV: saved.env });
    if (saved.host === undefined) delete process.env.SMTP_HOST;
    if (saved.from === undefined) delete process.env.MAIL_FROM;
    if (saved.env === undefined) delete process.env.NODE_ENV;
  }
  const { subject, text } = resetEmail('Asha', 'https://x.test/reset-password?token=abc');
  assert.match(subject, /password/i);
  assert.match(text, /Asha/);
  assert.match(text, /1 hour/);
});

test('user and log models carry the new account fields', () => {
  const user = new User({ name: 'A', email: 'a@example.com', password: 'password1' });
  assert.equal(user.disabled, false);
  assert.equal(user.passwordChangedAt, null);
  assert.equal(user.toSafeObject().disabled, undefined, 'disabled is an admin-only field');
  for (const type of ['password.reset', 'student.updated', 'student.disabled', 'student.enabled', 'student.deleted']) {
    assert.ok(ACTIVITY_TYPES.includes(type), type);
    assert.equal(new ActivityLog({ type, message: 'x' }).validateSync(), undefined);
  }
});

function run(token, user) {
  const findById = mock.method(User, 'findById', async () => user);
  const req = { cookies: { token } };
  const result = { status: null, next: false };
  const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; } };
  return protect(req, res, () => { result.next = true; }).then(() => { findById.mock.restore(); return result; });
}

test('protect rejects disabled accounts and sessions older than a password change', async () => {
  const issuedAt = Math.floor(Date.now() / 1000) - 120;
  const token = jwt.sign({ id: 'u1', iat: issuedAt }, process.env.JWT_SECRET);
  const base = { _id: 'u1', isDemo: false, lastActiveAt: new Date(), disabled: false, passwordChangedAt: null };

  assert.equal((await run(token, { ...base })).next, true);

  const disabled = await run(token, { ...base, disabled: true });
  assert.equal(disabled.status, 401);
  assert.match(disabled.body.message, /disabled/);

  const stale = await run(token, { ...base, passwordChangedAt: new Date() });
  assert.equal(stale.status, 401);
  assert.match(stale.body.message, /password was changed/);

  const fresh = await run(token, { ...base, passwordChangedAt: new Date((issuedAt - 60) * 1000) });
  assert.equal(fresh.next, true, 'a session created after the change is fine');
});

test('every email attempt is recorded without its body, and "today" starts at local midnight', async () => {
  const created = mock.method(EmailLog, 'create', async () => ({}));
  const saved = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  const log = mock.method(console, 'log', () => {});
  try {
    await sendMail({ to: 'a@example.com', subject: '123456 is your code', text: 'secret body 123456', type: 'signup-code' });
  } finally {
    log.mock.restore();
    if (saved !== undefined) process.env.SMTP_HOST = saved;
  }
  assert.equal(created.mock.callCount(), 1);
  const row = created.mock.calls[0].arguments[0];
  assert.deepEqual({ type: row.type, to: row.to, status: row.status }, { type: 'signup-code', to: 'a@example.com', status: 'skipped' });
  assert.equal(JSON.stringify(row).includes('secret body'), false, 'the body must not be stored');
  created.mock.restore();

  const noon = new Date(2026, 10, 25, 15, 30);
  assert.equal(startOfToday(noon).getTime(), new Date(2026, 10, 25).getTime());
  const ttl = EmailLog.schema.indexes().find(([k, o]) => k.createdAt === 1 && o?.expireAfterSeconds);
  assert.ok(ttl, 'old email logs expire');
});
