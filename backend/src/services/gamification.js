import User from '../models/User.js';

const POINTS_BY_DIFFICULTY = { Easy: 10, Medium: 20, Hard: 30 };
const POINTS_PER_LEVEL = 100;

export async function awardTaskPoints(userId, task) {
  const points = POINTS_BY_DIFFICULTY[task.difficulty];
  if (!points) throw new Error(`Unsupported task difficulty: ${task.difficulty}`);

  const user = await User.findOneAndUpdate(
    { _id: userId, completedTaskIds: { $ne: task._id } },
    [
      {
        $set: {
          completedTaskIds: {
            $setUnion: [{ $ifNull: ['$completedTaskIds', []] }, [task._id]],
          },
          points: { $add: [{ $ifNull: ['$points', 0] }, points] },
        },
      },
      {
        $set: {
          level: { $add: [1, { $floor: { $divide: ['$points', POINTS_PER_LEVEL] } }] },
        },
      },
    ],
    { new: true, projection: { points: 1, level: 1 }, updatePipeline: true },
  ).lean();

  if (!user) return null;

  const previousLevel = Math.floor((user.points - points) / POINTS_PER_LEVEL) + 1;
  return {
    points,
    totalPoints: user.points,
    level: user.level,
    levelUp: user.level > previousLevel,
  };
}
