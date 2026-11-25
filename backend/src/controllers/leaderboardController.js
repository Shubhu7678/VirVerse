import User from '../models/User.js';
import { isAdmin } from '../services/learningAccess.js';

const rankable = { platformRole: null, isDemo: false };

// Students see names, levels and points only. Admins also see how many questions each student solved.
export async function leaderboard(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const admin = isAdmin(req.user);

  const [rows, total] = await Promise.all([
    User.aggregate([
      { $match: rankable },
      { $sort: { points: -1, createdAt: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          name: 1,
          points: { $ifNull: ['$points', 0] },
          level: { $ifNull: ['$level', 1] },
          ...(admin && { solved: { $size: { $ifNull: ['$completedTaskIds', []] } } }),
        },
      },
    ]),
    User.countDocuments(rankable),
  ]);

  // The student's own position, even when they are not on the requested page.
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

  res.json({
    entries: rows.map((r, i) => ({
      id: r._id,
      rank: (page - 1) * limit + i + 1,
      name: r.name,
      points: r.points,
      level: r.level,
      you: String(r._id) === String(req.user._id),
      ...(admin && { solved: r.solved }),
    })),
    total,
    page,
    limit,
    me,
    showSolved: admin,
  });
}
