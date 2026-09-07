import express from 'express';
import { runCode, submitCode } from '../controllers/executeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Strict Authentication: Only verified student or admin accounts can test/run and submit code
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);

export default router;
