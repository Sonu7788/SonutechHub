import express from 'express';
import {
  getQuestionSubmissions,
  getUserStats,
  getAdminAnalytics
} from '../controllers/submissionController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-stats', protect, getUserStats);
router.get('/question/:questionId', protect, getQuestionSubmissions);
router.get('/admin-analytics', protect, requireAdmin, getAdminAnalytics);

export default router;
