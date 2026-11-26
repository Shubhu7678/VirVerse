import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import WebDevelopmentProgress, { HTML_TASK_IDS, HTML_TASK_TITLES } from '../models/WebDevelopmentProgress.js';
import ActivityLog from '../models/ActivityLog.js';
import { HTML_LEVELS, HTML_TASKS } from '../../../frontend/src/data/htmlBasics.js';
import User from '../models/User.js';
import { listHtmlProgress, saveHtmlProgress } from '../controllers/webDevelopmentController.js';

test('progress task IDs include every frontend lesson and project exactly once', () => {
  assert.deepEqual(HTML_TASKS.map((task) => task.id), HTML_TASK_IDS);
  assert.equal(new Set(HTML_TASK_IDS).size, HTML_TASK_IDS.length);
});

test('activity log titles match the frontend course data', () => {
  assert.deepEqual(HTML_TASK_TITLES, Object.fromEntries(HTML_TASKS.map((task) => [task.id, task.title])));
});

test('HTML lessons are organized into three levels with small topic groups and distributed projects', () => {
  assert.deepEqual(HTML_LEVELS.map((level) => level.id), ['basic', 'intermediate', 'advanced']);

  const groupedLessonIds = HTML_LEVELS.flatMap((level) =>
    level.lessonGroups.flatMap((group) => {
      assert.ok(group.taskIds.length <= 4, `${group.title} should keep the card group small`);
      return group.taskIds;
    }),
  );
  const groupedProjectIds = HTML_LEVELS.flatMap((level) => level.projectIds);
  const lessonIds = HTML_TASKS.filter((task) => task.category !== 'project').map((task) => task.id);
  const projectIds = HTML_TASKS.filter((task) => task.category === 'project').map((task) => task.id);

  assert.deepEqual([...groupedLessonIds].sort(), [...lessonIds].sort());
  assert.deepEqual([...groupedProjectIds].sort(), [...projectIds].sort());
});

test('HTML progress schema restricts task IDs, code length and duplicate user-task records', async () => {
  const user = new mongoose.Types.ObjectId();
  const valid = new WebDevelopmentProgress({
    user,
    taskId: 'html-01-first-page',
    code: '<h1>Hello</h1>',
    completed: false,
  });
  await valid.validate();

  const validProject = new WebDevelopmentProgress({
    user,
    taskId: 'html-project-portfolio',
    code: '<main><h1>Portfolio</h1></main>',
    completed: false,
  });
  await validProject.validate();

  const invalidTask = new WebDevelopmentProgress({ user, taskId: 'html-11-unknown', code: '' });
  await assert.rejects(invalidTask.validate(), (error) => Boolean(error.errors.taskId));

  const oversizedCode = new WebDevelopmentProgress({
    user,
    taskId: 'html-01-first-page',
    code: 'x'.repeat(20001),
  });
  await assert.rejects(oversizedCode.validate(), (error) => Boolean(error.errors.code));

  const uniqueIndex = WebDevelopmentProgress.schema.indexes().find(([keys, options]) =>
    keys.user === 1 && keys.taskId === 1 && options.unique,
  );
  assert.ok(uniqueIndex, 'user and task ID should have a unique compound index');
})

test('HTML progress queries are scoped to the authenticated user', async () => {
  const authenticatedUser = new mongoose.Types.ObjectId();
  const originalFind = WebDevelopmentProgress.find;
  const originalFindOneAndUpdate = WebDevelopmentProgress.findOneAndUpdate;
  const originalUpdateMany = WebDevelopmentProgress.updateMany;
  let findFilter;
  let updateFilter;
  let updateDocument;

  WebDevelopmentProgress.find = (filter) => {
    findFilter = filter;
    return { select() { return this }, async lean() { return [] } };
  };
  WebDevelopmentProgress.findOneAndUpdate = (filter, update) => {
    updateFilter = filter;
    updateDocument = update;
    return { select() { return this }, async lean() { return { taskId: filter.taskId } } };
  };
  WebDevelopmentProgress.updateMany = async () => ({ modifiedCount: 0 });

  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  };

  try {
    await listHtmlProgress({ user: { _id: authenticatedUser } }, response);
    assert.equal(findFilter.user, authenticatedUser);

    await saveHtmlProgress({
      params: { taskId: 'html-01-first-page' },
      body: { code: '<h1>Saved</h1>', completed: true, user: 'untrusted-user-id' },
      user: { _id: authenticatedUser },
    }, response);
    assert.equal(updateFilter.user, authenticatedUser);
    assert.equal(updateFilter.taskId, 'html-01-first-page');
    assert.deepEqual(updateDocument.$set, { code: '<h1>Saved</h1>', completed: true });
    assert.equal(updateDocument.$setOnInsert.user, authenticatedUser);
    assert.equal(updateDocument.$setOnInsert.taskId, 'html-01-first-page');
  } finally {
    WebDevelopmentProgress.find = originalFind;
    WebDevelopmentProgress.findOneAndUpdate = originalFindOneAndUpdate;
    WebDevelopmentProgress.updateMany = originalUpdateMany;
  }
})

function fakeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  };
}

test('finishing an HTML task pays 20 points once and only for a task that has not paid yet', async () => {
  const userId = new mongoose.Types.ObjectId();
  const original = {
    findOneAndUpdate: WebDevelopmentProgress.findOneAndUpdate,
    findById: WebDevelopmentProgress.findById,
    updateMany: WebDevelopmentProgress.updateMany,
    updateOne: WebDevelopmentProgress.updateOne,
    userUpdate: User.findOneAndUpdate,
    logCreate: ActivityLog.create,
  };
  const logged = [];
  ActivityLog.create = async (entry) => { logged.push(entry) };
  const recordId = new mongoose.Types.ObjectId();
  let claimFilter;
  let claimUpdate;
  let pointsPipeline;
  let claimed = 1;

  WebDevelopmentProgress.findOneAndUpdate = () => ({
    select() { return this },
    async lean() { return { _id: recordId, taskId: 'html-01-first-page', completed: true, pointsAwarded: false } },
  });
  WebDevelopmentProgress.findById = () => ({ select() { return this }, async lean() { return { pointsAwarded: true } } });
  let completedAtSet = null;
  WebDevelopmentProgress.updateOne = async (_filter, update) => { completedAtSet = update.$set.completedAt; return {} };
  WebDevelopmentProgress.updateMany = async (filter, update) => {
    claimFilter = filter;
    claimUpdate = update;
    return { modifiedCount: claimed };
  };
  User.findOneAndUpdate = (_filter, pipeline) => {
    pointsPipeline = pipeline;
    return { async lean() { return { points: 20, level: 1 } } };
  };

  try {
    const request = { params: { taskId: 'html-01-first-page' }, body: { code: '<h1>Hello World</h1>', completed: true }, user: { _id: userId, name: 'Test Student' } };
    const response = fakeResponse();
    await saveHtmlProgress(request, response);

    assert.deepEqual(response.body.reward, { points: 20, totalPoints: 20, level: 1, levelUp: false });
    assert.equal(response.body.progress.pointsAwarded, true);
    // Only this user's completed tasks that have not paid yet are claimed, and only ones with saved code.
    assert.equal(claimFilter.user, userId);
    assert.equal(claimFilter.completed, true);
    assert.deepEqual(claimFilter.pointsAwarded, { $ne: true });
    assert.deepEqual(claimUpdate, { $set: { pointsAwarded: true } });
    assert.ok(pointsPipeline, 'points are added after the claim succeeds');
    assert.ok(completedAtSet instanceof Date, 'the finish time is remembered for the submissions list');
    // The admin activity log gets one readable entry the first time the task pays out.
    assert.equal(logged.length, 1);
    assert.equal(logged[0].type, 'question.completed');
    assert.equal(logged[0].message, 'Test Student completed “Create Your First HTML Page” (HTML)');
    assert.deepEqual(logged[0].meta, { task: 'html-01-first-page', language: 'html' });

    // Finishing it again: nothing left to claim, so no points are added.
    claimed = 0;
    pointsPipeline = null;
    const again = fakeResponse();
    await saveHtmlProgress(request, again);
    assert.equal(again.body.reward, null);
    assert.equal(pointsPipeline, null);
    assert.equal(logged.length, 1, 'nothing more is logged when the task is finished again');
  } finally {
    WebDevelopmentProgress.findOneAndUpdate = original.findOneAndUpdate;
    WebDevelopmentProgress.findById = original.findById;
    WebDevelopmentProgress.updateMany = original.updateMany;
    WebDevelopmentProgress.updateOne = original.updateOne;
    User.findOneAndUpdate = original.userUpdate;
    ActivityLog.create = original.logCreate;
  }
})

test('saving code without completing the task never pays points', async () => {
  const original = { findOneAndUpdate: WebDevelopmentProgress.findOneAndUpdate, updateMany: WebDevelopmentProgress.updateMany };
  let claimCalls = 0;
  WebDevelopmentProgress.findOneAndUpdate = () => ({
    select() { return this },
    async lean() { return { taskId: 'html-02-headings', completed: false, pointsAwarded: false } },
  });
  WebDevelopmentProgress.updateMany = async () => { claimCalls += 1; return { modifiedCount: 0 } };

  try {
    const response = fakeResponse();
    await saveHtmlProgress({
      params: { taskId: 'html-02-headings' },
      body: { code: '<h1>Draft</h1>' },
      user: { _id: new mongoose.Types.ObjectId() },
    }, response);
    assert.equal(claimCalls, 0);
    assert.equal(response.body.reward, null);
  } finally {
    WebDevelopmentProgress.findOneAndUpdate = original.findOneAndUpdate;
    WebDevelopmentProgress.updateMany = original.updateMany;
  }
})

test('reopening an HTML task clears its finish date but never the paid flag', async () => {
  const original = WebDevelopmentProgress.findOneAndUpdate;
  let update;
  WebDevelopmentProgress.findOneAndUpdate = (_filter, doc) => {
    update = doc;
    return { select() { return this }, async lean() { return { taskId: 'html-02-headings', completed: false, pointsAwarded: true } } };
  };

  try {
    const response = fakeResponse();
    await saveHtmlProgress({
      params: { taskId: 'html-02-headings' },
      body: { code: '<p>starter</p>', completed: false },
      user: { _id: new mongoose.Types.ObjectId(), name: 'Test Student' },
    }, response);
    assert.deepEqual(update.$set, { code: '<p>starter</p>', completed: false, completedAt: null });
    assert.equal('pointsAwarded' in update.$set, false, 'the points already paid stay paid, so they cannot be earned twice');
    assert.equal(response.body.reward, null);
  } finally {
    WebDevelopmentProgress.findOneAndUpdate = original;
  }
})
