import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { CATEGORIES } from '../config/categories.js';
import { JAVASCRIPT_CATEGORIES } from '../config/javascriptCategories.js';
import { PYTHON_CATEGORIES } from '../config/pythonCategories.js';
import { canAccessTask, hasLanguageLearningAccess } from '../services/learningAccess.js';

// Maps task id -> { status: 'completed' | 'attempted', lastAt } for the given user.
// A task counts as completed once it has at least one Accepted submission (counted once).
async function getStatusMap(userId) {
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
  const expandedAccess = await hasLanguageLearningAccess(req.user, req.get('x-org-id'), language);
  const accessFilter = req.user.isDemo
    ? { category: categoriesForLanguage[0].slug, questionOrder: { $gte: 1, $lte: 10 } }
    : expandedAccess
      ? {}
      : { category: categoriesForLanguage[0].slug };
  const languageFilter = language === 'c'
    ? { $or: [{ language: 'c' }, { language: { $exists: false } }] }
    : { language };
  const taskFilter = { ...languageFilter, ...accessFilter };
  const [tasks, statusMap] = await Promise.all([
    Task.find(taskFilter)
      .select('-testCases -description -starterCode').sort({ order: 1 }).lean(),
    getStatusMap(req.user._id),
  ]);

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

  res.json({
    tasks: withStatus,
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
  if (!await canAccessTask(req.user, task, req.get('x-org-id'))) {
    return res.status(403).json({
      message: 'This topic is available to learners who are members of an active VirVerse organization.',
      code: 'ORGANIZATION_MEMBERSHIP_REQUIRED',
    });
  }

  const statusMap = await getStatusMap(req.user._id);
  const language = task.language ?? 'c';
  const category = language === 'javascript'
    ? 'js-basics'
    : language === 'python' ? 'python-basics' : CATEGORIES[0].slug;
  const nextFilter = req.user.isDemo
    ? {
      category,
      questionOrder: { $gt: task.questionOrder, $lte: 10 },
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
  if (!await canAccessTask(req.user, task, req.get('x-org-id'))) {
    return res.status(403).json({
      message: 'This topic is available to learners who are members of an active VirVerse organization.',
      code: 'ORGANIZATION_MEMBERSHIP_REQUIRED',
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
