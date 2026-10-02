import express from 'express';
import {
  getAllPatterns,
  getPatternByIdOrSlug,
  createPattern,
  updatePattern,
  deletePattern
} from '../controllers/patternController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPatterns);
router.get('/:idOrSlug', getPatternByIdOrSlug);
router.post('/', protect, requireAdmin, createPattern);
router.put('/:id', protect, requireAdmin, updatePattern);
router.delete('/:id', protect, requireAdmin, deletePattern);

export default router;

