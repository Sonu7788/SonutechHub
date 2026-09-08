import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

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

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      dailyStreak: 1,
      maxStreak: 1,
      lastLoginDate: new Date()
    });

    const token = generateToken(user._id);

    res.status(201).json({
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
