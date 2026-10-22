import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { awardTaskPoints } from '../services/gamification.js';

test('awards difficulty points once and reports a level-up', async () => {
  const userId = new mongoose.Types.ObjectId();
  const taskId = new mongoose.Types.ObjectId();
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  let filter;
  let update;
  User.findOneAndUpdate = (query, pipeline, options) => {
    filter = query;
    update = pipeline;
    assert.deepEqual(options, { new: true, projection: { points: 1, level: 1 }, updatePipeline: true });
    return { lean: async () => ({ points: 110, level: 2 }) };
  };

  try {
    const reward = await awardTaskPoints(userId, { _id: taskId, difficulty: 'Medium' });
    assert.deepEqual(reward, { points: 20, totalPoints: 110, level: 2, levelUp: true });
    assert.equal(filter._id, userId);
    assert.deepEqual(filter.completedTaskIds, { $ne: taskId });
    assert.deepEqual(update[0].$set.points, { $add: [{ $ifNull: ['$points', 0] }, 20] });
    assert.deepEqual(update[1].$set.level, { $add: [1, { $floor: { $divide: ['$points', 100] } }] });
  } finally {
    User.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('does not award points again for an already completed task', async () => {
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  User.findOneAndUpdate = () => ({ lean: async () => null });

  try {
    assert.equal(
      await awardTaskPoints(new mongoose.Types.ObjectId(), {
        _id: new mongoose.Types.ObjectId(),
        difficulty: 'Hard',
      }),
      null,
    );
  } finally {
    User.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('rejects unsupported task difficulty instead of silently awarding zero points', async () => {
  await assert.rejects(
    awardTaskPoints(new mongoose.Types.ObjectId(), {
      _id: new mongoose.Types.ObjectId(),
      difficulty: 'Expert',
    }),
    /Unsupported task difficulty/,
  );
});
