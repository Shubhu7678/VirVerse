import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import { executeProgram, classifyRun, ExecutorError } from '../services/executor/index.js';
import { canAccessTask } from '../services/learningAccess.js';
import Membership from '../models/OrganizationMembership.js';
import Organization from '../models/Organization.js';
import Assignment from '../models/Assignment.js';
import AssignmentTask from '../models/AssignmentTask.js';
import ClassEnrollment from '../models/ClassEnrollment.js';
import { hasFeatureAccess } from '../services/subscriptionAccess.js';
import { awardTaskPoints } from '../services/gamification.js';

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
  const { taskSlug, code, assignmentId } = req.body;

  const task = await Task.findOne({ slug: taskSlug });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const selectedOrganizationId = req.get('x-org-id') || null;
  if (selectedOrganizationId) {
    const [membership, organization] = await Promise.all([
      Membership.exists({ user: req.user._id, organization: selectedOrganizationId, status: 'active' }),
      Organization.exists({ _id: selectedOrganizationId, status: 'active' }),
    ]);
    if (!membership || !organization) return res.status(403).json({ message: 'Invalid active organization' });
  }
  if (!await canAccessTask(req.user, task, selectedOrganizationId)) {
    return res.status(403).json({
      message: 'This topic is available to learners who are members of an active VirVerse organization.',
      code: 'ORGANIZATION_MEMBERSHIP_REQUIRED',
    });
  }
  let assignment = null;
  if (assignmentId) {
    if (!selectedOrganizationId) return res.status(400).json({ message: 'Select an organization before submitting assignment work' });
    if (!await hasFeatureAccess(selectedOrganizationId, ['assignments', 'basic-assignments'])) {
      return res.status(403).json({ message: 'This organization subscription does not currently allow assignment submissions' });
    }
    assignment = await Assignment.findOne({
      _id: assignmentId,
      organization: selectedOrganizationId,
      status: 'published',
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.startsAt > new Date()) return res.status(403).json({ message: 'This assignment is not available yet' });
    const [requiredTask, enrollment, studentMembership] = await Promise.all([
      AssignmentTask.exists({
        organization: selectedOrganizationId,
        assignment: assignment._id,
        task: task._id,
      }),
      ClassEnrollment.exists({
        organization: selectedOrganizationId,
        class: assignment.class,
        student: req.user._id,
        status: 'active',
      }),
      Membership.exists({
        user: req.user._id,
        organization: selectedOrganizationId,
        role: 'student',
        status: 'active',
      }),
    ]);
    if (!requiredTask || !enrollment || !studentMembership) return res.status(403).json({ message: 'You are not authorized to submit this assignment task' });
  }
  if (task.testCases.length === 0) return res.status(400).json({ message: 'This task has no test cases yet' });

  let outcome;
  try {
    outcome = await executeProgram({ code, inputs: task.testCases.map((tc) => withNewline(tc.input)) });
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
    organization: selectedOrganizationId,
    task: task._id,
    assignment: assignment?._id ?? null,
    code,
    status,
    passedCount,
    totalCount: task.testCases.length,
  });
  const reward = status === 'Accepted' ? await awardTaskPoints(req.user._id, task) : null;

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
    .populate('task', 'title slug difficulty category')
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
        task: { title: s.task.title, slug: s.task.slug, difficulty: s.task.difficulty, category: s.task.category },
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
