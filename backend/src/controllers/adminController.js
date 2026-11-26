import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import ActivityLog, { ACTIVITY_TYPES } from '../models/ActivityLog.js';
import EmailLog, { EMAIL_TYPES } from '../models/EmailLog.js';
import { logActivity } from '../services/activity.js';
import WebDevelopmentProgress from '../models/WebDevelopmentProgress.js';
import { LANGUAGES } from '../services/learningAccess.js';
import { issueResetLink } from '../services/passwordReset.js';
import { sendMail, resetEmail } from '../services/mailer.js';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// `$ne: true` also matches older accounts that never had an isDemo field stored.
const studentFilter = { platformRole: null, isDemo: { $ne: true } };

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
  disabled: Boolean(u.disabled),
  solved: Object.fromEntries(LANGUAGES.map((l) => [l, solved.get(`${u._id}:${l}`) ?? 0])),
});

// Start of "today" in the server's time zone.
export const startOfToday = (now = new Date()) => new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Gmail's free accounts allow roughly 500 messages a day. Override with EMAIL_DAILY_LIMIT.
const emailDailyLimit = () => Number(process.env.EMAIL_DAILY_LIMIT) || 500;

async function emailStatsToday() {
  const rows = await EmailLog.aggregate([
    { $match: { createdAt: { $gte: startOfToday() } } },
    { $group: { _id: { type: '$type', status: '$status' }, n: { $sum: 1 } } },
  ]);
  const count = (status) => rows.filter((r) => r._id.status === status).reduce((n, r) => n + r.n, 0);
  const byType = Object.fromEntries(EMAIL_TYPES.map((t) => [t, rows.filter((r) => r._id.type === t && r._id.status === 'sent').reduce((n, r) => n + r.n, 0)]));
  return { sent: count('sent'), failed: count('failed'), skipped: count('skipped'), byType, limit: emailDailyLimit() };
}

export async function stats(_req, res) {
  const [students, unlocked, submissions, emails] = await Promise.all([
    User.countDocuments(studentFilter),
    User.countDocuments({ ...studentFilter, 'unlockedLanguages.0': { $exists: true } }),
    Submission.countDocuments(),
    emailStatsToday(),
  ]);
  res.json({ students, unlocked, locked: students - unlocked, submissions, emails });
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
  if (req.query.status === 'disabled') filter.disabled = true;
  if (req.query.status === 'active') filter.disabled = { $ne: true };
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

// ---- Account tools -------------------------------------------------------

const findStudent = (id) => (mongoose.isValidObjectId(id) ? User.findOne({ _id: id, ...studentFilter }) : null);

export async function updateStudent(req, res) {
  const student = await findStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { name, email } = req.body;
  if (email && email !== student.email && await User.exists({ email, _id: { $ne: student._id } })) {
    return res.status(409).json({ message: 'That email is already used by another account' });
  }
  const before = `${student.name} <${student.email}>`;
  if (name) student.name = name;
  if (email) student.email = email;
  await student.save();
  await logActivity({
    type: 'student.updated',
    actor: req.user._id,
    target: student._id,
    message: `${req.user.name} changed the details of ${before} to ${student.name} <${student.email}>`,
  });
  res.json({ student: toStudent(student.toObject(), new Map()) });
}

// Emails the student a reset link and also returns it, so the admin can pass it on if email is not set up.
export async function resetStudentPassword(req, res) {
  const student = await findStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { link, expiresAt } = await issueResetLink(student);
  const { subject, text } = resetEmail(student.name, link);
  const { sent } = await sendMail({ to: student.email, subject, text, type: 'admin-reset' });
  await logActivity({
    type: 'password.reset',
    actor: req.user._id,
    target: student._id,
    message: `${req.user.name} sent a password reset link to ${student.name}${sent ? '' : ' (not emailed)'}`,
  });
  res.json({ emailed: sent, link, expiresAt });
}

export async function setStudentDisabled(req, res) {
  const disabled = req.path.endsWith('/disable');
  const student = await findStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  student.disabled = disabled;
  await student.save();
  await logActivity({
    type: disabled ? 'student.disabled' : 'student.enabled',
    actor: req.user._id,
    target: student._id,
    message: `${req.user.name} ${disabled ? 'disabled' : 'enabled'} the account of ${student.name}`,
  });
  res.json({ disabled });
}

// Permanent. The admin must type the student's exact email as confirmation.
export async function deleteStudent(req, res) {
  const student = await findStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  if (String(req.body?.confirmEmail || '').trim().toLowerCase() !== student.email) {
    return res.status(400).json({ message: 'Type the student\'s email exactly to confirm' });
  }
  await Promise.all([
    Submission.deleteMany({ user: student._id }),
    WebDevelopmentProgress.deleteMany({ user: student._id }),
  ]);
  await student.deleteOne();
  // target stays empty: the account no longer exists, the name is in the message.
  await logActivity({ type: 'student.deleted', actor: req.user._id, message: `${req.user.name} deleted ${student.name} <${student.email}> and all their data` });
  res.json({ deleted: true });
}

// Newest first, 10 per page. Today's totals come from /admin/stats.
export async function listEmails(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = {};
  if (EMAIL_TYPES.includes(req.query.type)) filter.type = req.query.type;
  if (['sent', 'failed', 'skipped'].includes(req.query.status)) filter.status = req.query.status;
  const [emails, total, today] = await Promise.all([
    EmailLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    EmailLog.countDocuments(filter),
    emailStatsToday(),
  ]);
  res.json({
    emails: emails.map((e) => ({ id: e._id, type: e.type, to: e.to, subject: e.subject, status: e.status, error: e.error, createdAt: e.createdAt })),
    total, page, limit, today,
  });
}
