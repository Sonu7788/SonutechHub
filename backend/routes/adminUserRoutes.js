import express from 'express';
import {
  getAllUsers,
  getUserDetails,
  updateUserByAdmin,
  toggleBlockUser,
  deleteUserByAdmin
} from '../controllers/adminUserController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserDetails);
router.put('/:id', updateUserByAdmin);
router.patch('/:id/toggle-block', toggleBlockUser);
router.delete('/:id', deleteUserByAdmin);

export default router;
