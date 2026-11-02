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

test('demo users can access only the first ten JavaScript Basics questions', async () => {
  const demo = { isDemo: true };
  const javascriptTask = (questionOrder, category = 'js-basics') => ({
    language: 'javascript',
    category,
    questionOrder,
  });

  test('demo users can access only the first ten Python Basics questions', async () => {
    const demo = { isDemo: true };
    const pythonTask = (questionOrder, category = 'python-basics') => ({
      language: 'python',
      category,
      questionOrder,
    });

    assert.equal(await canAccessTask(demo, pythonTask(1)), true);
    assert.equal(await canAccessTask(demo, pythonTask(10)), true);
    assert.equal(await canAccessTask(demo, pythonTask(11)), false);
    assert.equal(await canAccessTask(demo, pythonTask(20)), false);
    assert.equal(await canAccessTask(demo, pythonTask(1, 'python-numbers')), false);
  });

  assert.equal(await canAccessTask(demo, javascriptTask(1)), true);
  assert.equal(await canAccessTask(demo, javascriptTask(5)), true);
  assert.equal(await canAccessTask(demo, javascriptTask(10)), true);
  assert.equal(await canAccessTask(demo, javascriptTask(11)), false);
  assert.equal(await canAccessTask(demo, javascriptTask(20)), false);
  assert.equal(await canAccessTask(demo, javascriptTask(1, 'js-numbers')), false);
});

test('demo user and submission records expire automatically', () => {
  const userTtl = User.schema.indexes().find(([keys]) => keys.demoExpiresAt === 1)?.[1];
  const submissionTtl = Submission.schema.indexes().find(([keys]) => keys.expiresAt === 1)?.[1];

  assert.equal(userTtl?.expireAfterSeconds, 0);
  assert.deepEqual(userTtl?.partialFilterExpression, { isDemo: true });
  assert.equal(submissionTtl?.expireAfterSeconds, 0);
});
