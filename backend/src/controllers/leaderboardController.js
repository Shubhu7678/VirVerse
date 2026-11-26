import User from '../models/User.js';
import WebDevelopmentProgress from '../models/WebDevelopmentProgress.js';
import { isAdmin } from '../services/learningAccess.js';

// `$ne: true` also matches older accounts that never had an isDemo field stored; `isDemo: false` would skip them.
const rankable = { platformRole: null, isDemo: { $ne: true } };

const PODIUM_SIZE = 3;

// Accounts from before levels existed have no level stored, and count as level 1.
const levelMatch = (level) => {
  if (!Number.isInteger(level) || level < 1) return {};
  return level === 1 ? { $or: [{ level: 1 }, { level: { $exists: false } }, { level: null }] } : { level };
};

// Students see names, levels and points only. Admins also see how many questions each student solved,
// counting finished HTML lessons and projects too.
export async function leaderboard(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const admin = isAdmin(req.user);
  const tableMatch = { ...rankable, ...levelMatch(Number(req.query.level)) };
  const skip = (page - 1) * limit;

  const ranked = (match, from, count) => User.aggregate([
    { $match: match },
    { $sort: { points: -1, createdAt: 1 } },
    { $skip: from },
    { $limit: count },
    {
      $project: {
        name: 1,
        points: { $ifNull: ['$points', 0] },
        level: { $ifNull: ['$level', 1] },
        ...(admin && { solved: { $size: { $ifNull: ['$completedTaskIds', []] } } }),
      },
    },
  ]);

  // The top three are the same on every page and ignore the level filter. The table lists everyone,
  // top three included, so each person can find their own row.
  const [rows, podiumRows, total, overall, levelRows] = await Promise.all([
    ranked(tableMatch, skip, limit),
    req.query.podium === 'true' ? ranked(rankable, 0, PODIUM_SIZE) : [],
    User.countDocuments(tableMatch),
    User.countDocuments(rankable),
    User.aggregate([
      { $match: rankable },
      { $group: { _id: { $ifNull: ['$level', 1] } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const htmlSolved = new Map();
  if (admin) {
    const ids = [...rows, ...podiumRows].map((r) => r._id);
    const counts = await WebDevelopmentProgress.aggregate([
      { $match: { user: { $in: ids }, completed: true } },
      { $group: { _id: '$user', n: { $sum: 1 } } },
    ]);
    for (const { _id, n } of counts) htmlSolved.set(String(_id), n);
  }

  // The student's own position among everyone, even when they are not on the requested page.
  let me = null;
  if (!admin && !req.user.isDemo) {
    const ahead = await User.countDocuments({
      ...rankable,
      $or: [
        { points: { $gt: req.user.points ?? 0 } },
        { points: req.user.points ?? 0, createdAt: { $lt: req.user.createdAt } },
      ],
    });
    me = { rank: ahead + 1, points: req.user.points ?? 0, level: req.user.level ?? 1 };
  }

  const toEntry = (from) => (r, i) => ({
    id: r._id,
    rank: from + i + 1,
    name: r.name,
    points: r.points,
    level: r.level,
    you: String(r._id) === String(req.user._id),
    ...(admin && { solved: r.solved + (htmlSolved.get(String(r._id)) ?? 0) }),
  });

  res.json({
    ...(req.query.podium === 'true' && { podium: podiumRows.map(toEntry(0)) }),
    entries: rows.map(toEntry(skip)),
    total,
    overall,
    levels: levelRows.map((row) => row._id),
    page,
    limit,
    me,
    showSolved: admin,
  });
}
