import User from '../models/User.js';
import Submission from '../models/Submission.js';
import bcrypt from 'bcryptjs';

// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status === 'blocked') {
      filter.isBlocked = true;
    } else if (status === 'active') {
      filter.isBlocked = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Format users with solved count
    const enrichedUsers = users.map(u => ({
      ...u.toObject(),
      solvedCount: u.solvedQuestions?.length || 0
    }));

    res.json({
      success: true,
      total,
      users: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users/:id
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('solvedQuestions', 'title difficulty category tags');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user's submissions history with code
    const submissions = await Submission.find({ user: user._id })
      .populate('question', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      user,
      submissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/users/:id
export const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, password, isBlocked, blockReason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use by another user' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    if (typeof isBlocked === 'boolean') {
      user.isBlocked = isBlocked;
      if (blockReason !== undefined) user.blockReason = blockReason;
    }

    // If new password provided, hash and update
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    res.json({
      success: true,
      message: 'User account updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        blockReason: user.blockReason,
        solvedCount: user.solvedQuestions?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/admin/users/:id/toggle-block
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent blocking oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block your own admin account.' });
    }

    user.isBlocked = !user.isBlocked;
    if (req.body.blockReason) {
      user.blockReason = req.body.blockReason;
    } else if (!user.isBlocked) {
      user.blockReason = '';
    }

    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isBlocked ? 'blocked from practicing' : 'unblocked successfully'}`,
      isBlocked: user.isBlocked,
      blockReason: user.blockReason
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/admin/users/:id
export const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await Submission.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and all associated submission history deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
