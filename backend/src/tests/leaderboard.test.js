import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import User from '../models/User.js';
import WebDevelopmentProgress from '../models/WebDevelopmentProgress.js';
import { leaderboard } from '../controllers/leaderboardController.js';

const fakeResponse = () => ({ body: null, json(body) { this.body = body; return this } });

// Records every query the leaderboard makes, and answers the ranking query with the given rows.
function stubUsers({ rows = [], levels = [{ _id: 1 }] } = {}) {
  const original = { aggregate: User.aggregate, countDocuments: User.countDocuments };
  const calls = { pipelines: [], filters: [] };
  User.aggregate = async (pipeline) => {
    calls.pipelines.push(pipeline);
    return pipeline.some((stage) => stage.$group) ? levels : rows;
  };
  User.countDocuments = async (filter) => {
    calls.filters.push(filter);
    return 6;
  };
  return { calls, restore() { Object.assign(User, original) } };
}

const student = (overrides = {}) => ({ _id: new mongoose.Types.ObjectId(), points: 20, createdAt: new Date(), isDemo: false, platformRole: null, ...overrides });

test('the leaderboard ranks older accounts that never had an isDemo field stored', async () => {
  const stub = stubUsers();
  try {
    await leaderboard({ query: {}, user: student() }, fakeResponse());
    const matches = [...stub.calls.pipelines.map((pipeline) => pipeline[0].$match), ...stub.calls.filters];
    assert.ok(matches.length >= 4, 'ranking, levels, totals and own position are all queried');
    for (const filter of matches) {
      // `isDemo: false` would skip accounts where the field is missing; `$ne: true` keeps them.
      assert.deepEqual(filter.isDemo, { $ne: true });
      assert.equal(filter.platformRole, null);
    }
  } finally {
    stub.restore();
  }
})

test('the table lists everyone from rank 1 while the top three are returned separately', async () => {
  const first = student({ name: 'Dev', points: 30, level: 1 });
  const second = student({ name: 'Mohit', points: 20, level: 1 });
  const stub = stubUsers({ rows: [first, second] });
  try {
    const response = fakeResponse();
    await leaderboard({ query: { podium: 'true', page: '1', limit: '10' }, user: student() }, response);

    const tableSkip = stub.calls.pipelines.find((p) => p.some((s) => s.$skip !== undefined)).find((s) => s.$skip !== undefined).$skip;
    assert.equal(tableSkip, 0, 'page 1 of the table starts at the very first student');
    assert.deepEqual(response.body.entries.map((entry) => entry.rank), [1, 2]);
    assert.deepEqual(response.body.podium.map((entry) => entry.rank), [1, 2]);
    assert.equal(response.body.total, 6);
    assert.deepEqual(response.body.levels, [1]);
  } finally {
    stub.restore();
  }
})

test('filtering by level narrows the table but not the top three', async () => {
  const stub = stubUsers();
  try {
    await leaderboard({ query: { podium: 'true', level: '2' }, user: student() }, fakeResponse());
    const rankingMatches = stub.calls.pipelines.filter((p) => p.some((s) => s.$sort && s.$sort.points)).map((p) => p[0].$match);
    // Table and top three are two queries: one filtered to level 2, one over everyone.
    assert.equal(rankingMatches.filter((m) => m.level === 2).length, 1);
    assert.equal(rankingMatches.filter((m) => m.level === undefined && !m.$or).length, 1);

    stub.calls.pipelines.length = 0;
    await leaderboard({ query: { level: '1' }, user: student() }, fakeResponse());
    const levelOne = stub.calls.pipelines.find((p) => p.some((s) => s.$sort && s.$sort.points))[0].$match;
    // Accounts with no stored level count as level 1.
    assert.deepEqual(levelOne.$or, [{ level: 1 }, { level: { $exists: false } }, { level: null }]);
  } finally {
    stub.restore();
  }
})

test('only admins see solved counts, and finished HTML tasks are included', async () => {
  const learner = student({ name: 'Dev', solved: 3 });
  const stub = stubUsers({ rows: [learner] });
  const originalHtml = WebDevelopmentProgress.aggregate;
  let htmlMatch;
  WebDevelopmentProgress.aggregate = async (pipeline) => {
    htmlMatch = pipeline[0].$match;
    return [{ _id: learner._id, n: 2 }];
  };

  try {
    const asAdmin = fakeResponse();
    await leaderboard({ query: {}, user: student({ platformRole: 'super_admin' }) }, asAdmin);
    assert.equal(asAdmin.body.showSolved, true);
    assert.equal(asAdmin.body.entries[0].solved, 5, '3 coding questions plus 2 HTML tasks');
    assert.equal(htmlMatch.completed, true);

    const asStudent = fakeResponse();
    await leaderboard({ query: {}, user: student() }, asStudent);
    assert.equal(asStudent.body.showSolved, false);
    assert.equal('solved' in asStudent.body.entries[0], false);
  } finally {
    stub.restore();
    WebDevelopmentProgress.aggregate = originalHtml;
  }
})
