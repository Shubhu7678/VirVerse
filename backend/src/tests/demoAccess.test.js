import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canAccessTask, hasOrganizationLearningAccess } from '../services/learningAccess.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';

test('demo users can access only the first ten C Basics questions', async () => {
  const demo = { isDemo: true };
  const basicsTask = (questionOrder) => ({ category: 'basics', questionOrder });

  assert.equal(await canAccessTask(demo, basicsTask(1)), true);
  assert.equal(await canAccessTask(demo, basicsTask(10)), true);
  assert.equal(await canAccessTask(demo, basicsTask(0)), false);
  assert.equal(await canAccessTask(demo, basicsTask(11)), false);
  assert.equal(await canAccessTask(demo, { category: 'variables', questionOrder: 1 }), false);
  assert.equal(await hasOrganizationLearningAccess(demo, 'any-org-id'), false);
});

test('demo user and submission records expire automatically', () => {
  const userTtl = User.schema.indexes().find(([keys]) => keys.demoExpiresAt === 1)?.[1];
  const submissionTtl = Submission.schema.indexes().find(([keys]) => keys.expiresAt === 1)?.[1];

  assert.equal(userTtl?.expireAfterSeconds, 0);
  assert.deepEqual(userTtl?.partialFilterExpression, { isDemo: true });
  assert.equal(submissionTtl?.expireAfterSeconds, 0);
});
