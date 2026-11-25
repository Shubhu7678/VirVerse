import { Router } from 'express';
import protect from '../middleware/auth.js';
import { leaderboard } from '../controllers/leaderboardController.js';

const router = Router();
router.get('/', protect, leaderboard);

export default router;
