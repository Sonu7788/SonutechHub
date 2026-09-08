import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/leaderboard
router.get('/', optionalAuth, getLeaderboard);

export default router;
