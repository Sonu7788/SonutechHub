import express from 'express';
import {
  getAllPatterns,
  getPatternByIdOrSlug,
  createPattern,
  updatePattern,
  deletePattern
} from '../controllers/patternController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllPatterns);
router.get('/:idOrSlug', getPatternByIdOrSlug);
router.post('/', protect, adminOnly, createPattern);
router.put('/:id', protect, adminOnly, updatePattern);
router.delete('/:id', protect, adminOnly, deletePattern);

export default router;
