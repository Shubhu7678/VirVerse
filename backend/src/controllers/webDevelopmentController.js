import WebDevelopmentProgress, { HTML_TASK_TITLES } from '../models/WebDevelopmentProgress.js';
import { HTML_TASK_POINTS, addPoints } from '../services/gamification.js';
import { logActivity } from '../services/activity.js';

const FIELDS = 'taskId code completed pointsAwarded completedAt createdAt updatedAt';

// Pays 20 points for each completed task that has not paid yet. Claiming first and paying after means
// two requests at once can never pay the same task twice. Also catches up tasks finished before points existed.
async function awardPendingHtmlPoints(userId) {
  const claimed = await WebDevelopmentProgress.updateMany(
    { user: userId, completed: true, pointsAwarded: { $ne: true }, code: { $regex: '\\S' } },
    { $set: { pointsAwarded: true } },
  );
  if (!claimed.modifiedCount) return null;
  return addPoints(userId, claimed.modifiedCount * HTML_TASK_POINTS);
}

export async function listHtmlProgress(req, res) {
  const reward = await awardPendingHtmlPoints(req.user._id);
  const progress = await WebDevelopmentProgress.find({ user: req.user._id })
    .select(FIELDS)
    .lean();

  res.json({ progress, reward });
}

export async function saveHtmlProgress(req, res) {
  const { taskId } = req.params;
  const update = {};
  if (Object.hasOwn(req.body, 'code')) update.code = req.body.code;
  if (Object.hasOwn(req.body, 'completed')) update.completed = req.body.completed;
  // Reopening a task clears its finish date, so finishing it again records a new one.
  // The points already paid stay paid (`pointsAwarded` is never reset), so they cannot be earned twice.
  if (update.completed === false) update.completedAt = null;

  if (!Object.keys(update).length) {
    return res.status(400).json({ message: 'Provide code or completion status to save.' });
  }

  const progress = await WebDevelopmentProgress.findOneAndUpdate(
    { user: req.user._id, taskId },
    {
      $set: update,
      $setOnInsert: {
        user: req.user._id,
        taskId,
        ...(req.user.isDemo ? { expiresAt: req.user.demoExpiresAt } : {}),
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
    .select(FIELDS)
    .lean();

  // Remember when it was first finished, so the submissions list can show the date.
  if (progress.completed && !progress.completedAt) {
    progress.completedAt = new Date();
    await WebDevelopmentProgress.updateOne(
      { _id: progress._id, completedAt: null },
      { $set: { completedAt: progress.completedAt } },
      { timestamps: false },
    );
  }

  let reward = null;
  let awarded = Boolean(progress.pointsAwarded);
  if (progress.completed) {
    reward = await awardPendingHtmlPoints(req.user._id);
    if (reward) {
      const fresh = await WebDevelopmentProgress.findById(progress._id).select('pointsAwarded').lean();
      awarded = Boolean(fresh?.pointsAwarded);
      // Each task is logged once, the moment it first pays out. Throwaway demo sessions are left out.
      if (awarded && !progress.pointsAwarded && !req.user.isDemo) {
        await logActivity({
          type: 'question.completed',
          actor: req.user._id,
          target: req.user._id,
          message: `${req.user.name} completed “${HTML_TASK_TITLES[taskId] ?? taskId}” (HTML)`,
          meta: { task: taskId, language: 'html' },
        });
      }
    }
  }
  res.json({ progress: { ...progress, pointsAwarded: awarded }, reward });
}
