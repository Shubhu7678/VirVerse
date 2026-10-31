import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import WebDevelopmentProgress, { HTML_TASK_IDS } from '../models/WebDevelopmentProgress.js';
import { HTML_LEVELS, HTML_TASKS } from '../../../frontend/src/data/htmlBasics.js';
import { listHtmlProgress, saveHtmlProgress } from '../controllers/webDevelopmentController.js';

test('progress task IDs include every frontend lesson and project exactly once', () => {
  assert.deepEqual(HTML_TASKS.map((task) => task.id), HTML_TASK_IDS);
  assert.equal(new Set(HTML_TASK_IDS).size, HTML_TASK_IDS.length);
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
  }
})
