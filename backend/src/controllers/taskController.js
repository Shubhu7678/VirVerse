import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { CATEGORIES } from '../config/categories.js';
import { JAVASCRIPT_CATEGORIES } from '../config/javascriptCategories.js';
import { PYTHON_CATEGORIES } from '../config/pythonCategories.js';
import { guideForQuestion } from '../data/guides/index.js';
import { canAccessTask, hasLanguageLearningAccess, FIRST_CATEGORY, FREE_QUESTION_LIMIT } from '../services/learningAccess.js';

// Maps task id -> { status: 'completed' | 'attempted', lastAt } for the given user.
// A task counts as completed once it has at least one Accepted submission (counted once).
export async function getStatusMap(userId) {
  const rows = await Submission.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$task',
        solved: { $max: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
        lastAt: { $max: '$createdAt' },
      },
    },
  ]);
  return new Map(
    rows.map((r) => [String(r._id), { status: r.solved ? 'completed' : 'attempted', lastAt: r.lastAt }]),
  );
}

const progressState = (percent) => (percent === 0 ? 'not-started' : percent === 100 ? 'completed' : 'in-progress');

export async function listTasks(req, res) {
  const language = req.query.language || 'c';
  if (!['c', 'javascript', 'python'].includes(language)) {
    return res.status(400).json({ message: 'Unsupported programming language.' });
  }
  const categoriesForLanguage = language === 'javascript'
    ? JAVASCRIPT_CATEGORIES
    : language === 'python' ? PYTHON_CATEGORIES : CATEGORIES;
  const expandedAccess = hasLanguageLearningAccess(req.user, language);
  // Without an unlock only the free questions are returned; the rest are not visible at all.
  const accessFilter = expandedAccess
    ? {}
    : { category: FIRST_CATEGORY[language], questionOrder: { $gte: 1, $lte: FREE_QUESTION_LIMIT } };
  const languageFilter = language === 'c'
    ? { $or: [{ language: 'c' }, { language: { $exists: false } }] }
    : { language };
  const taskFilter = { ...languageFilter, ...accessFilter };
  const [tasks, statusMap, categoryCounts] = await Promise.all([
    Task.find(taskFilter)
      .select('slug title category order difficulty questionOrder').sort({ order: 1 }).lean(),
    getStatusMap(req.user._id),
    // Real size of every topic, so locked topics can say how much is inside without exposing questions.
    Task.aggregate([{ $match: languageFilter }, { $group: { _id: '$category', n: { $sum: 1 } } }]),
  ]);
  const questionCounts = new Map(categoryCounts.map((c) => [c._id, c.n]));

  const withStatus = tasks.map((t) => ({
    id: t._id,
    slug: t.slug,
    title: t.title,
    category: t.category,
    language,
    order: t.order,
    difficulty: t.difficulty,
    questionOrder: t.questionOrder,
    status: statusMap.get(String(t._id))?.status || 'todo',
    lastAttemptAt: statusMap.get(String(t._id))?.lastAt || null,
  }));

  const categories = categoriesForLanguage.map((c) => {
    const inCategory = withStatus.filter((t) => t.category === c.slug);
    const completed = inCategory.filter((t) => t.status === 'completed').length;
    const percent = inCategory.length ? Math.round((completed / inCategory.length) * 100) : 0;
    const count = (d) => inCategory.filter((t) => t.difficulty === d).length;
    return {
      ...c,
      total: inCategory.length,
      questionCount: questionCounts.get(c.slug) ?? 0,
      completed,
      percent,
      locked: !expandedAccess && c.slug !== categoriesForLanguage[0].slug,
      progressState: progressState(percent),
      difficulty: { easy: count('Easy'), medium: count('Medium'), hard: count('Hard') },
      nextSlug: (inCategory.find((t) => t.status !== 'completed') || inCategory[0])?.slug || null,
    };
  });

  const completed = withStatus.filter((t) => t.status === 'completed').length;

  // Most recently attempted unfinished question; otherwise the first question not yet solved.
  const lastAttempted = withStatus
    .filter((t) => t.status === 'attempted')
    .sort((a, b) => new Date(b.lastAttemptAt) - new Date(a.lastAttemptAt))[0];
  const continueTask = lastAttempted || withStatus.find((t) => t.status === 'todo') || null;

  // ?summary=true leaves the question list out (counts, categories and "continue" only).
  // ?category=<slug> returns only that topic's questions. ?resumeSlug=<slug> adds that
  // question as `resumeTask` when it exists and is unfinished.
  const summaryOnly = req.query.summary === 'true';
  const onlyCategory = typeof req.query.category === 'string' ? req.query.category : null;
  const resumeTask = typeof req.query.resumeSlug === 'string'
    ? withStatus.find((t) => t.slug === req.query.resumeSlug && t.status !== 'completed')
    : null;
  const tasksOut = summaryOnly
    ? undefined
    : onlyCategory ? withStatus.filter((t) => t.category === onlyCategory) : withStatus;

  res.json({
    ...(tasksOut && { tasks: tasksOut }),
    ...(resumeTask && { resumeTask: { slug: resumeTask.slug, title: resumeTask.title, category: resumeTask.category } }),
    categories,
    stats: {
      total: withStatus.length,
      completed,
      pending: withStatus.length - completed,
      percent: withStatus.length ? Math.round((completed / withStatus.length) * 100) : 0,
    },
    continueTask: continueTask && {
      slug: continueTask.slug,
      language,
      title: continueTask.title,
      category: continueTask.category,
      difficulty: continueTask.difficulty,
      attempted: continueTask.status === 'attempted',
    },
  });
}

export async function getTask(req, res) {
  const task = await Task.findOne({ slug: req.params.slug }).lean();
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({
      message: 'This topic is locked. Ask your admin to unlock it for you.',
      code: 'ACCESS_LOCKED',
    });
  }

  const statusMap = await getStatusMap(req.user._id);
  const language = task.language ?? 'c';
  const nextFilter = !hasLanguageLearningAccess(req.user, language)
    ? {
      category: FIRST_CATEGORY[language],
      questionOrder: { $gt: task.questionOrder, $lte: FREE_QUESTION_LIMIT },
      ...(language === 'c'
        ? { $or: [{ language: 'c' }, { language: { $exists: false } }] }
        : { language }),
    }
    : language === 'c'
      ? { order: { $gt: task.order }, $or: [{ language: 'c' }, { language: { $exists: false } }] }
      : { language, order: { $gt: task.order } };
  const next = await Task.findOne(nextFilter).sort({ order: 1 }).select('slug').lean();
  const sampleTests = task.testCases
    .filter((tc) => !tc.isHidden)
    .map(({ input, expectedOutput }) => ({ input, expectedOutput }));

  // Hidden test cases and their expected answers are never returned.
  res.json({
    task: {
      id: task._id,
      slug: task.slug,
      title: task.title,
      category: task.category,
      questionOrder: task.questionOrder,
      language,
      difficulty: task.difficulty,
      description: task.description,
      ...((language !== 'c' || task.category === 'basics') && task.questionOrder <= 20
        ? { hint: task.hint }
        : {}),
      exampleInput: task.exampleInput,
      exampleOutput: task.exampleOutput,
      constraints: task.constraints,
      starterCode: task.starterCode,
      sampleTests,
      hiddenTestCount: task.testCases.length - sampleTests.length,
      ...(guideForQuestion(language, task.slug) && { guide: guideForQuestion(language, task.slug) }),
      solutionAvailable: task.questionOrder >= 1 && task.questionOrder <= 20
        && (language !== 'c' || task.category === 'basics'),
      status: statusMap.get(String(task._id))?.status || 'todo',
      nextSlug: next?.slug || null,
    },
  });
}

export async function getTaskSolution(req, res) {
  const task = await Task.findOne({ slug: req.params.slug })
    .select('+solution +solutionNotes')
    .lean();
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const language = task.language ?? 'c';
  const supportedSolution = task.questionOrder >= 1 && task.questionOrder <= 20
    && (language !== 'c' || task.category === 'basics');
  if (!supportedSolution) {
    return res.status(404).json({ message: 'A worked solution is not available for this task' });
  }
  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({
      message: 'This topic is locked. Ask your admin to unlock it for you.',
      code: 'ACCESS_LOCKED',
    });
  }
  if (!task.solution || !task.solutionNotes) {
    return res.status(503).json({ message: 'The worked solution is not available yet' });
  }

  if (language !== 'c') {
    return res.json({ solution: task.solution, notes: task.solutionNotes });
  }
  res.json({ solution: task.solution, notes: task.solutionNotes });
}
