import WebDevelopmentProgress from '../models/WebDevelopmentProgress.js';

export async function listHtmlProgress(req, res) {
  const progress = await WebDevelopmentProgress.find({ user: req.user._id })
    .select('taskId code completed createdAt updatedAt')
    .lean();

  res.json({ progress });
}

export async function saveHtmlProgress(req, res) {
  const { taskId } = req.params;
  const update = {};
  if (Object.hasOwn(req.body, 'code')) update.code = req.body.code;
  if (Object.hasOwn(req.body, 'completed')) update.completed = req.body.completed;

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
    .select('taskId code completed createdAt updatedAt')
    .lean();

  res.json({ progress });
}
