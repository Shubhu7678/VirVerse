import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import ActivityLog, { ACTIVITY_TYPES } from '../models/ActivityLog.js';
import { logActivity } from '../services/activity.js';
import { LANGUAGES } from '../services/learningAccess.js';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const studentFilter = { platformRole: null, isDemo: false };

// Number of distinct tasks each user has solved, per language: Map<"userId:language", count>.
async function solvedCounts(userIds) {
  const rows = await Submission.aggregate([
    { $match: { user: { $in: userIds }, status: 'Accepted' } },
    { $group: { _id: { user: '$user', task: '$task' } } },
    { $lookup: { from: 'tasks', localField: '_id.task', foreignField: '_id', as: 'task' } },
    { $unwind: '$task' },
    { $group: { _id: { user: '$_id.user', language: { $ifNull: ['$task.language', 'c'] } }, solved: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [`${r._id.user}:${r._id.language}`, r.solved]));
}

const toStudent = (u, solved) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  unlockedLanguages: u.unlockedLanguages ?? [],
  points: u.points ?? 0,
  level: u.level ?? 1,
  createdAt: u.createdAt,
  lastActiveAt: u.lastActiveAt ?? null,
  solved: Object.fromEntries(LANGUAGES.map((l) => [l, solved.get(`${u._id}:${l}`) ?? 0])),
});

export async function stats(_req, res) {
  const [students, unlocked, submissions] = await Promise.all([
    User.countDocuments(studentFilter),
    User.countDocuments({ ...studentFilter, 'unlockedLanguages.0': { $exists: true } }),
    Submission.countDocuments(),
  ]);
  res.json({ students, unlocked, locked: students - unlocked, submissions });
}

export async function listStudents(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const search = String(req.query.search || '').trim().slice(0, 80);
  const filter = { ...studentFilter };
  if (search) {
    const re = new RegExp(escapeRe(search), 'i');
    filter.$or = [{ name: re }, { email: re }];
  }
  if (req.query.access === 'locked') filter.unlockedLanguages = { $size: 0 };
  if (req.query.access === 'unlocked') filter['unlockedLanguages.0'] = { $exists: true };

  const [users, total] = await Promise.all([
    User.find(filter).sort(req.query.sort === 'active' ? { lastActiveAt: -1, createdAt: -1 } : { createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  const solved = await solvedCounts(users.map((u) => u._id));
  res.json({ students: users.map((u) => toStudent(u, solved)), total, page, limit });
}

export async function getStudent(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
  const user = await User.findOne({ _id: req.params.id, ...studentFilter }).lean();
  if (!user) return res.status(404).json({ message: 'Student not found' });

  const [totals, accepted, recent] = await Promise.all([
    Task.aggregate([{ $group: { _id: { language: { $ifNull: ['$language', 'c'] }, category: '$category' }, total: { $sum: 1 } } }]),
    Submission.aggregate([
      { $match: { user: user._id, status: 'Accepted' } },
      { $group: { _id: '$task' } },
      { $lookup: { from: 'tasks', localField: '_id', foreignField: '_id', as: 'task' } },
      { $unwind: '$task' },
      { $group: { _id: { language: { $ifNull: ['$task.language', 'c'] }, category: '$task.category' }, solved: { $sum: 1 } } },
    ]),
    Submission.find({ user: user._id }).sort({ createdAt: -1 }).limit(15).populate('task', 'title slug language difficulty').lean(),
  ]);

  const solvedBy = new Map(accepted.map((r) => [`${r._id.language}:${r._id.category}`, r.solved]));
  const languages = LANGUAGES.map((language) => {
    const categories = totals
      .filter((t) => t._id.language === language)
      .map((t) => ({ category: t._id.category, total: t.total, solved: solvedBy.get(`${language}:${t._id.category}`) ?? 0 }))
      .sort((a, b) => a.category.localeCompare(b.category));
    const total = categories.reduce((n, c) => n + c.total, 0);
    const solved = categories.reduce((n, c) => n + c.solved, 0);
    return { language, unlocked: (user.unlockedLanguages ?? []).includes(language), total, solved, categories };
  });

  res.json({
    student: toStudent(user, new Map(languages.map((l) => [`${user._id}:${l.language}`, l.solved]))),
    languages,
    recent: recent.filter((s) => s.task).map((s) => ({
      id: s._id,
      status: s.status,
      passedCount: s.passedCount,
      totalCount: s.totalCount,
      createdAt: s.createdAt,
      task: s.task,
    })),
  });
}

export async function updateAccess(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Student not found' });
  const languages = req.body.languages;
  if (!Array.isArray(languages) || languages.some((l) => !LANGUAGES.includes(l))) {
    return res.status(400).json({ message: `languages must be a list of: ${LANGUAGES.join(', ')}` });
  }
  const before = await User.findOne({ _id: req.params.id, ...studentFilter }).select('unlockedLanguages').lean();
  if (!before) return res.status(404).json({ message: 'Student not found' });
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, ...studentFilter },
    { unlockedLanguages: [...new Set(languages)] },
    { new: true },
  ).lean();
  const old = before.unlockedLanguages ?? [];
  const unlocked = user.unlockedLanguages.filter((l) => !old.includes(l));
  const locked = old.filter((l) => !user.unlockedLanguages.includes(l));
  const names = { c: 'C', javascript: 'JavaScript', python: 'Python' };
  const parts = [
    unlocked.length && `unlocked ${unlocked.map((l) => names[l]).join(', ')}`,
    locked.length && `locked ${locked.map((l) => names[l]).join(', ')}`,
  ].filter(Boolean);
  if (parts.length) {
    await logActivity({
      type: 'access.updated',
      actor: req.user._id,
      target: user._id,
      message: `${req.user.name} ${parts.join(' and ')} for ${user.name}`,
      meta: { unlocked, locked },
    });
  }
  res.json({ unlockedLanguages: user.unlockedLanguages });
}

// Newest first. Defaults to 10 per page; older entries are reached with ?page=.
export async function listLogs(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = ACTIVITY_TYPES.includes(req.query.type) ? { type: req.query.type } : {};
  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityLog.countDocuments(filter),
  ]);
  res.json({
    logs: logs.map((l) => ({ id: l._id, type: l.type, message: l.message, target: l.target, createdAt: l.createdAt })),
    total,
    page,
    limit,
  });
}
