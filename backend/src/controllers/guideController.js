import Task from '../models/Task.js';
import { GUIDES } from '../data/guides/index.js';
import { getStatusMap } from './taskController.js';
import { FREE_QUESTION_LIMIT, hasLanguageLearningAccess } from '../services/learningAccess.js';

// The first lessons are free like the first questions; the rest follow the language unlock.
export const isLessonLocked = (user, language, lesson) =>
  lesson.n > FREE_QUESTION_LIMIT && !hasLanguageLearningAccess(user, language);

const minutesToRead = (lesson) => Math.max(2, Math.round(lesson.steps.length * 1.2 + 1));

// Lightweight row used by the guide index and the lesson table of contents.
// It never carries the lesson body, so the list stays small as the guide grows.
const toSummary = (lesson, solved, locked) => ({
  slug: lesson.slug,
  n: lesson.n,
  section: lesson.section,
  title: lesson.title,
  summary: lesson.summary,
  question: lesson.question,
  solved,
  locked,
  minutes: minutesToRead(lesson),
});

async function solvedQuestions(userId, lessons) {
  const tasks = await Task.find({ slug: { $in: lessons.map((l) => l.question) } }).select('_id slug').lean();
  const statusMap = await getStatusMap(userId);
  return new Set(tasks.filter((t) => statusMap.get(String(t._id))?.status === 'completed').map((t) => t.slug));
}

export async function listGuide(req, res) {
  const lessons = GUIDES[req.params.language];
  if (!lessons) return res.status(404).json({ message: 'No guide for this language yet.' });
  const solved = await solvedQuestions(req.user._id, lessons);
  res.json({ language: req.params.language, lessons: lessons.map((l) => toSummary(l, solved.has(l.question), isLessonLocked(req.user, req.params.language, l))) });
}

export async function getGuideLesson(req, res) {
  const lessons = GUIDES[req.params.language];
  const index = lessons ? lessons.findIndex((l) => l.slug === req.params.slug) : -1;
  if (index === -1) return res.status(404).json({ message: 'Lesson not found.' });
  const lesson = lessons[index];
  if (isLessonLocked(req.user, req.params.language, lesson)) {
    return res.status(403).json({ message: 'This lesson is locked. Ask your admin to unlock Python for you.', code: 'ACCESS_LOCKED' });
  }
  const link = (l) => l && { slug: l.slug, n: l.n, title: l.title };
  // Lesson text is static, so browsers may reuse it briefly.
  res.set('Cache-Control', 'private, max-age=300');
  res.json({
    lesson: { ...lesson, total: lessons.length, minutes: minutesToRead(lesson) },
    prev: link(lessons[index - 1]),
    next: link(lessons[index + 1]),
  });
}
