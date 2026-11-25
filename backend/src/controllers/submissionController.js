import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { executeProgram, classifyRun, ExecutorError } from '../services/executor/index.js';
import { canAccessTask } from '../services/learningAccess.js';
import { awardTaskPoints } from '../services/gamification.js';
import { logActivity } from '../services/activity.js';

// Ignores trailing spaces on each line and trailing blank lines.
const normalize = (s) =>
  s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');

const withNewline = (s) => (s && !s.endsWith('\n') ? `${s}\n` : s);

// Maps a single run onto a per-test verdict.
function judgeCase(testCase, run) {
  const runStatus = classifyRun(run);
  if (runStatus === 'Time Limit Exceeded') return 'Time Limit Exceeded';
  if (runStatus !== 'Success') return 'Runtime Error';
  return normalize(run.stdout) === normalize(testCase.expectedOutput) ? 'Passed' : 'Wrong Answer';
}

export async function createSubmission(req, res) {
  const { taskSlug, code } = req.body;

  const task = await Task.findOne({ slug: taskSlug });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!canAccessTask(req.user, task)) {
    return res.status(403).json({
      message: 'This topic is locked. Ask your admin to unlock it for you.',
      code: 'ACCESS_LOCKED',
    });
  }
  if (task.testCases.length === 0) return res.status(400).json({ message: 'This task has no test cases yet' });

  let outcome;
  try {
    outcome = await executeProgram({
      code,
      inputs: task.testCases.map((tc) => withNewline(tc.input)),
      language: task.language ?? 'c',
    });
  } catch (err) {
    if (err instanceof ExecutorError) return res.status(err.status).json({ message: err.message });
    throw err;
  }

  let status;
  let results = [];
  let compileOutput = '';

  if (!outcome.compile.ok) {
    status = 'Compilation Error';
    compileOutput = outcome.compile.output;
  } else {
    results = task.testCases.map((tc, i) => {
      const run = outcome.runs[i];
      if (!run) {
        return {
          index: i + 1,
          hidden: tc.isHidden,
          passed: false,
          status: 'Not Run',
          ...(!tc.isHidden && {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            stderr: '',
          }),
        };
      }
      const verdict = judgeCase(tc, run);
      const base = { index: i + 1, hidden: tc.isHidden, passed: verdict === 'Passed', status: verdict };
      // Hidden cases never expose input, expected output or the program's output.
      if (tc.isHidden) return base;
      return {
        ...base,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: run.stdout,
        stderr: run.stderr,
      };
    });

    const firstFailure = results.find((r) => !r.passed);
    status = firstFailure ? firstFailure.status : 'Accepted';
  }

  const passedCount = results.filter((r) => r.passed).length;
  const submission = await Submission.create({
    user: req.user._id,
    task: task._id,
    code,
    status,
    passedCount,
    totalCount: task.testCases.length,
    ...(req.user.isDemo ? { expiresAt: req.user.demoExpiresAt } : {}),
  });
  const reward = status === 'Accepted' ? await awardTaskPoints(req.user._id, task) : null;
  // `reward` is only set the first time a question is solved, so each question is logged once.
  // Throwaway demo sessions are left out.
  if (reward && !req.user.isDemo) {
    const names = { c: 'C', javascript: 'JavaScript', python: 'Python' };
    await logActivity({
      type: 'question.completed',
      actor: req.user._id,
      target: req.user._id,
      message: `${req.user.name} completed “${task.title}” (${names[task.language ?? 'c']})`,
      meta: { task: task.slug, language: task.language ?? 'c' },
    });
  }

  res.status(201).json({
    submission: {
      id: submission._id,
      status,
      passedCount,
      totalCount: task.testCases.length,
      reward,
      compileOutput,
      results,
      createdAt: submission.createdAt,
    },
  });
}

export async function listSubmissions(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const submissions = await Submission.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-code')
    .populate('task', 'title slug difficulty category language')
    .lean();

  res.json({
    submissions: submissions
      .filter((s) => s.task)
      .map((s) => ({
        id: s._id,
        status: s.status,
        passedCount: s.passedCount,
        totalCount: s.totalCount,
        createdAt: s.createdAt,
        task: {
          title: s.task.title,
          slug: s.task.slug,
          difficulty: s.task.difficulty,
          category: s.task.category,
          language: s.task.language ?? 'c',
        },
      })),
  });
}

export async function listSubmissionActivity(req, res) {
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 371));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const activity = await Submission.aggregate([
    { $match: { user: req.user._id, createdAt: { $gte: startDate, $lt: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    asOf: now.toISOString().slice(0, 10),
    activity: activity.map(({ _id: date, count }) => ({ date, count })),
  });
}
