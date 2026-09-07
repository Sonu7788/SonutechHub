import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkUploadQuestions,
  downloadTemplate
} from '../controllers/questionController.js';
import { protect, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getQuestions);
router.get('/template', downloadTemplate);
router.get('/:idOrSlug', optionalAuth, getQuestion);

router.post('/', protect, requireAdmin, createQuestion);
router.post('/bulk-upload', protect, requireAdmin, upload.single('file'), bulkUploadQuestions);
router.put('/:id', protect, requireAdmin, updateQuestion);
router.delete('/:id', protect, requireAdmin, deleteQuestion);

export default router;
