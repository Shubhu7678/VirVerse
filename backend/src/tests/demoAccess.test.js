import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canAccessTask, hasOrganizationLearningAccess } from '../services/learningAccess.js';

test('demo users can access only the first ten C Basics questions', async () => {
  const demo = { isDemo: true };
  const basicsTask = (questionOrder) => ({ category: 'basics', questionOrder });

  assert.equal(await canAccessTask(demo, basicsTask(1)), true);
  assert.equal(await canAccessTask(demo, basicsTask(10)), true);
  assert.equal(await canAccessTask(demo, basicsTask(11)), false);
  assert.equal(await canAccessTask(demo, { category: 'variables', questionOrder: 1 }), false);
  assert.equal(await hasOrganizationLearningAccess(demo, 'any-org-id'), false);
});
