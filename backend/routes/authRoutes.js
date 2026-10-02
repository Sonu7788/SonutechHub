import express from 'express';
import { register, login, getMe, sendSignupOtp, resendOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-signup-otp', sendSignupOtp);
router.post('/resend-otp', resendOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;

