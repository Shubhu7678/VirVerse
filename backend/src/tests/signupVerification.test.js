import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import PendingSignup from '../models/PendingSignup.js';
import ActivityLog from '../models/ActivityLog.js';
import EmailLog from '../models/EmailLog.js';
import { signup, verifySignup, resendSignupCode } from '../controllers/authController.js';
import {
  CODE_TTL_MS, MAX_ATTEMPTS, RESEND_COOLDOWN_MS, codeMatches, generateCode, hashCode, isExpired, secondsUntilResend,
} from '../services/signupVerification.js';

process.env.JWT_SECRET ??= 'test-secret-test-secret-test-secret';
delete process.env.SMTP_HOST;
process.env.NODE_ENV = 'development';

const makeRes = () => {
  const res = { code: 200, body: null, cookies: [] };
  res.status = (c) => { res.code = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.cookie = (...a) => { res.cookies.push(a); return res; };
  return res;
};

test('codes are six digits, bound to the email, and checked safely', () => {
  for (let i = 0; i < 200; i += 1) assert.match(generateCode(), /^\d{6}$/);
  const pending = { email: 'a@example.com', codeHash: hashCode('a@example.com', '123456') };
  assert.equal(codeMatches(pending, '123456'), true);
  assert.equal(codeMatches(pending, '123457'), false);
  assert.equal(codeMatches(pending, '12345'), false, 'must be 6 digits');
  assert.equal(codeMatches(pending, 'abcdef'), false);
  assert.equal(codeMatches({ email: 'b@example.com', codeHash: pending.codeHash }, '123456'), false, 'code for another email');
  assert.notEqual(pending.codeHash, '123456', 'only a hash is stored');
});

test('expiry and resend cooldown', () => {
  const now = Date.now();
  assert.equal(isExpired({ expiresAt: new Date(now + 1000) }, now), false);
  assert.equal(isExpired({ expiresAt: new Date(now - 1) }, now), true);
  assert.equal(secondsUntilResend({ lastSentAt: new Date(now) }, now), RESEND_COOLDOWN_MS / 1000);
  assert.equal(secondsUntilResend({ lastSentAt: new Date(now - RESEND_COOLDOWN_MS) }, now), 0);
});

test('pending sign-ups expire on their own and never store a plain password', () => {
  const ttl = PendingSignup.schema.indexes().find(([k]) => k.expiresAt === 1)?.[1];
  assert.equal(ttl?.expireAfterSeconds, 0);
  assert.equal(PendingSignup.schema.path('password'), undefined);
});

test('sign-up creates no account until the emailed code is entered', async () => {
  const store = {};
  const logged = [];
  const log = mock.method(console, 'log', (...a) => logged.push(a.join(' ')));
  mock.method(User, 'exists', async () => null);
  mock.method(PendingSignup, 'findOneAndUpdate', async (q, update) => { Object.assign(store, { email: q.email, ...update, attempts: 0, save: async () => {} }); return store; });
  mock.method(PendingSignup, 'findOne', async () => (store.email ? store : null));
  const deleted = mock.method(PendingSignup, 'deleteOne', async () => { store.gone = true; });
  const inserted = mock.method(User, 'insertMany', async (docs) => [new User(docs[0])]);
  mock.method(ActivityLog, 'create', async () => ({}));
  mock.method(EmailLog, 'create', async () => ({}));

  // Step 1
  const res1 = makeRes();
  await signup({ body: { name: 'Asha', email: 'asha@example.com', password: 'secret123' } }, res1);
  log.mock.restore();
  assert.equal(res1.code, 202);
  assert.equal(inserted.mock.callCount(), 0, 'no account yet');
  assert.notEqual(store.passwordHash, 'secret123');
  assert.equal(await bcrypt.compare('secret123', store.passwordHash), true);
  const code = logged.join('\n').match(/\b(\d{6})\b/)?.[1];
  assert.ok(code, 'the code is in the email text');
  assert.equal(codeMatches(store, code), true);
  assert.ok(store.expiresAt.getTime() - Date.now() <= CODE_TTL_MS);

  // A wrong code is counted and does not create the account
  const wrong = makeRes();
  await verifySignup({ body: { email: 'asha@example.com', code: code === '000000' ? '111111' : '000000' } }, wrong);
  assert.equal(wrong.code, 400);
  assert.equal(store.attempts, 1);
  assert.equal(inserted.mock.callCount(), 0);

  // The right code creates the account, signs in and clears the pending row
  const ok = makeRes();
  await verifySignup({ body: { email: 'asha@example.com', code } }, ok);
  assert.equal(ok.code, 201);
  assert.equal(inserted.mock.callCount(), 1);
  assert.equal(inserted.mock.calls[0].arguments[0][0].password, store.passwordHash, 'stored hash is reused, not hashed again');
  assert.equal(ok.cookies.length, 1);
  assert.equal(deleted.mock.callCount(), 1);
  mock.restoreAll();
});

test('too many wrong codes cancel the sign-up; an expired code is refused; resend has a cooldown', async () => {
  const pending = { _id: 'p1', email: 'x@example.com', codeHash: hashCode('x@example.com', '123456'), expiresAt: new Date(Date.now() + 60000), attempts: MAX_ATTEMPTS - 1, lastSentAt: new Date(), sentCount: 1, save: async () => {} };
  const deleted = mock.method(PendingSignup, 'deleteOne', async () => {});
  mock.method(PendingSignup, 'findOne', async () => pending);
  mock.method(User, 'insertMany', async () => { throw new Error('must not create'); });

  const res = makeRes();
  await verifySignup({ body: { email: 'x@example.com', code: '999999' } }, res);
  assert.equal(res.body.code, 'TOO_MANY_ATTEMPTS');
  assert.equal(deleted.mock.callCount(), 1);

  pending.expiresAt = new Date(Date.now() - 1);
  const expired = makeRes();
  await verifySignup({ body: { email: 'x@example.com', code: '123456' } }, expired);
  assert.equal(expired.body.code, 'CODE_EXPIRED');

  const again = makeRes();
  await resendSignupCode({ body: { email: 'x@example.com' } }, again);
  assert.equal(again.code, 429, 'asked again within a minute');
  mock.restoreAll();
});
