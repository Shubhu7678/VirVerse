import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canAccessTask, hasLanguageLearningAccess } from '../services/learningAccess.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';

const FIRST = { c: 'basics', javascript: 'js-basics', python: 'python-basics' };
const task = (language, questionOrder, category = FIRST[language]) => ({ language, category, questionOrder });

test('everyone can open only the first ten questions of each language', () => {
  const student = { unlockedLanguages: [] };
  const demo = { isDemo: true };
  for (const user of [student, demo]) {
    for (const language of ['c', 'javascript', 'python']) {
      assert.equal(canAccessTask(user, task(language, 1)), true);
      assert.equal(canAccessTask(user, task(language, 10)), true);
      assert.equal(canAccessTask(user, task(language, 0)), false);
      assert.equal(canAccessTask(user, task(language, 11)), false);
      assert.equal(canAccessTask(user, task(language, 1, `${FIRST[language]}-other`)), false);
    }
  }
  // Older C tasks have no language field.
  assert.equal(canAccessTask(student, { category: 'basics', questionOrder: 3 }), true);
});

test('an admin unlocks one language at a time', () => {
  const student = { unlockedLanguages: ['python'] };
  assert.equal(hasLanguageLearningAccess(student, 'python'), true);
  assert.equal(hasLanguageLearningAccess(student, 'c'), false);
  assert.equal(canAccessTask(student, task('python', 15)), true);
  assert.equal(canAccessTask(student, task('python', 3, 'python-loops-lists')), true);
  assert.equal(canAccessTask(student, task('c', 15)), false);
  assert.equal(canAccessTask(student, task('javascript', 11)), false);
});

test('admins can open everything, demo sessions never unlock more', () => {
  const admin = { platformRole: 'super_admin' };
  assert.equal(canAccessTask(admin, task('c', 99, 'arrays')), true);
  assert.equal(hasLanguageLearningAccess(admin, 'javascript'), true);
  assert.equal(hasLanguageLearningAccess({ isDemo: true, unlockedLanguages: ['c'] }, 'c'), false);
});

test('the user model exposes admin and unlocked languages', () => {
  const user = new User({ name: 'A', email: 'a@example.com', password: 'password1', unlockedLanguages: ['c'] });
  const safe = user.toSafeObject();
  assert.equal(safe.isAdmin, false);
  assert.deepEqual(safe.unlockedLanguages, ['c']);
  assert.equal(new User({ name: 'B', email: 'b@example.com', password: 'password1', platformRole: 'super_admin' }).toSafeObject().isAdmin, true);
  const invalid = new User({ name: 'C', email: 'c@example.com', password: 'password1', unlockedLanguages: ['ruby'] });
  assert.ok(invalid.validateSync()?.errors, 'unknown languages are rejected');
});

test('demo user and submission records expire automatically', () => {
  const userTtl = User.schema.indexes().find(([keys]) => keys.demoExpiresAt === 1)?.[1];
  const submissionTtl = Submission.schema.indexes().find(([keys]) => keys.expiresAt === 1)?.[1];

  assert.equal(userTtl?.expireAfterSeconds, 0);
  assert.deepEqual(userTtl?.partialFilterExpression, { isDemo: true });
  assert.equal(submissionTtl?.expireAfterSeconds, 0);
});
