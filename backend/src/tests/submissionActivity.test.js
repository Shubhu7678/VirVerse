import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Submission from '../models/Submission.js';
import { listSubmissionActivity } from '../controllers/submissionController.js';

test('submission activity aggregates recent submissions for only the current user', async () => {
  const userId = new mongoose.Types.ObjectId();
  const originalAggregate = Submission.aggregate;
  const rows = [
    { _id: '2026-10-19', count: 2 },
    { _id: '2026-10-21', count: 1 },
  ];
  let pipeline;
  Submission.aggregate = async (aggregationPipeline) => {
    pipeline = aggregationPipeline;
    return rows;
  };

  try {
    let response;
    await listSubmissionActivity(
      { user: { _id: userId } },
      { json: (body) => { response = body } },
    );

    assert.match(response.asOf, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(response.activity, [
      { date: '2026-10-19', count: 2 },
      { date: '2026-10-21', count: 1 },
    ]);
    assert.deepEqual(pipeline[0].$match.user, userId);
    const today = new Date();
    assert.equal(
      pipeline[0].$match.createdAt.$gte.getTime(),
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 371),
    );
    assert.equal(
      pipeline[0].$match.createdAt.$lt.getTime(),
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1),
    );
    assert.equal(pipeline[1].$group._id.$dateToString.timezone, 'UTC');
    assert.equal(pipeline[1].$group.count.$sum, 1);
    assert.deepEqual(pipeline[2], { $sort: { _id: 1 } });
  } finally {
    Submission.aggregate = originalAggregate;
  }
});
