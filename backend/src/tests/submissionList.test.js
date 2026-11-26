import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import WebDevelopmentProgress from '../models/WebDevelopmentProgress.js';
import { listSubmissions } from '../controllers/submissionController.js';

test('the submissions list includes finished HTML tasks, newest first', async () => {
  const userId = new mongoose.Types.ObjectId();
  const original = { find: Submission.find, htmlFind: WebDevelopmentProgress.find };
  let htmlFilter;

  Submission.find = () => ({
    sort() { return this },
    limit() { return this },
    select() { return this },
    populate() { return this },
    async lean() {
      return [{
        _id: 'sub1',
        status: 'Accepted',
        passedCount: 3,
        totalCount: 3,
        createdAt: new Date('2026-10-20T10:00:00Z'),
        task: { title: 'Sum two numbers', slug: 'sum', difficulty: 'Easy', category: 'basics', language: 'c' },
      }];
    },
  });
  WebDevelopmentProgress.find = (filter) => {
    htmlFilter = filter;
    return {
      select() { return this },
      sort() { return this },
      limit() { return this },
      async lean() {
        return [
          { _id: 'h1', taskId: 'html-02-headings', completedAt: new Date('2026-10-21T09:00:00Z'), updatedAt: new Date('2026-10-22T09:00:00Z') },
          { _id: 'h0', taskId: 'html-01-first-page', updatedAt: new Date('2026-10-19T09:00:00Z') },
        ];
      },
    };
  };

  try {
    let body;
    await listSubmissions({ query: {}, user: { _id: userId } }, { json: (value) => { body = value } });

    // Only this user's finished tasks are listed.
    assert.equal(htmlFilter.user, userId);
    assert.equal(htmlFilter.completed, true);
    assert.deepEqual(body.submissions.map((entry) => entry.id), ['h1', 'sub1', 'h0']);
    assert.deepEqual(body.submissions[0], {
      id: 'h1',
      kind: 'html',
      taskId: 'html-02-headings',
      status: 'Completed',
      createdAt: new Date('2026-10-21T09:00:00Z'),
    });
    // Older records without a finish time fall back to their last update.
    assert.equal(body.submissions[2].createdAt.toISOString(), '2026-10-19T09:00:00.000Z');
  } finally {
    Submission.find = original.find;
    WebDevelopmentProgress.find = original.htmlFind;
  }
})
