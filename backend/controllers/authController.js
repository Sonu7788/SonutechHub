import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { generateToken } from '../middleware/auth.js';
import { sendOtpEmail } from '../utils/emailService.js';

// Helper to calculate & update daily login streak
export function updateDailyStreak(user) {
  const now = new Date();
  if (!user.lastLoginDate) {
    user.dailyStreak = 1;
    user.maxStreak = 1;
    user.lastLoginDate = now;
    return;
  }

  const lastLogin = new Date(user.lastLoginDate);
  const isSameDay = (
    now.getFullYear() === lastLogin.getFullYear() &&
    now.getMonth() === lastLogin.getMonth() &&
    now.getDate() === lastLogin.getDate()
  );

  if (isSameDay) {
    return; // Already recorded login for today
  }

  const oneDayMs = 24 * 60 * 60 * 1000;
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastMidnight = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()).getTime();
  const diffDays = Math.round((nowMidnight - lastMidnight) / oneDayMs);

  if (diffDays === 1) {
    // Consecutive day login streak
    user.dailyStreak = (user.dailyStreak || 0) + 1;
    if (user.dailyStreak > (user.maxStreak || 0)) {
      user.maxStreak = user.dailyStreak;
    }
  } else if (diffDays > 1) {
    // Streak broken, restart at 1
    user.dailyStreak = 1;
  }

  user.lastLoginDate = now;
}

// Generate a random 6-digit numeric OTP
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// @route POST /api/auth/send-signup-otp
export const sendSignupOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please log in or use a different email.'
      });
    }

    // Rate-limiting check: enforce 60-second cooldown between OTP requests for the same email
    const recentOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'signup',
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }
    });

    if (recentOtp) {
      const remainingSecs = Math.ceil((recentOtp.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSecs} seconds before requesting a new verification code.`
      });
    }

    // Generate new OTP and set 10-minute expiry
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous OTPs for this email & purpose
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'signup' });

    // Store the new OTP
    await Otp.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'signup',
      expiresAt,
      attempts: 0
    });

    // Send real SMTP email
    await sendOtpEmail({
      to: normalizedEmail,
      otp: otpCode,
      name: name?.trim() || 'Learner',
      purpose: 'signup'
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your inbox.`
    });
  } catch (error) {
    console.error('Error sending signup OTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification code. Please try again.'
    });
  }
};

// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  return sendSignupOtp(req, res);
};

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, and verification code).'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Lookup OTP in database
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'signup'
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Verification code not found or has expired. Please request a new code.'
      });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Check maximum attempts limit (max 5)
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.'
      });
    }

    // Verify matching OTP
    if (otpRecord.otp.trim() !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`
      });
    }

    // OTP is valid! Delete the OTP record
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'signup' });

    // Create the verified user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
      dailyStreak: 1,
      maxStreak: 1,
      lastLoginDate: new Date()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account successfully created and verified!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        dailyStreak: user.dailyStreak,
        maxStreak: user.maxStreak,
        solvedQuestions: user.solvedQuestions
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: 'Your account has been blocked by the administrator. You cannot practice or access tests.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update login streak
    updateDailyStreak(user);
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        dailyStreak: user.dailyStreak,
        maxStreak: user.maxStreak,
        solvedQuestions: user.solvedQuestions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('solvedQuestions', 'title difficulty category');
      
    if (user) {
      updateDailyStreak(user);
      await user.save();
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

