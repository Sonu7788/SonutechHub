import Submission from '../models/Submission.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @route GET /api/submissions/question/:questionId
export const getQuestionSubmissions = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const submissions = await Submission.find({
      user: userId,
      question: questionId
    }).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/submissions/my-stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'solvedQuestions',
      select: 'title difficulty category tags'
    });

    const totalQuestions = await Question.countDocuments();
    const easyTotal = await Question.countDocuments({ difficulty: 'Easy' });
    const mediumTotal = await Question.countDocuments({ difficulty: 'Medium' });
    const hardTotal = await Question.countDocuments({ difficulty: 'Hard' });

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    user.solvedQuestions.forEach(q => {
      if (q.difficulty === 'Easy') easySolved++;
      if (q.difficulty === 'Medium') mediumSolved++;
      if (q.difficulty === 'Hard') hardSolved++;
    });

    const recentSubmissions = await Submission.find({ user: userId })
      .populate('question', 'title difficulty slug category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalSolved: user.solvedQuestions.length,
        totalQuestions,
        easy: { solved: easySolved, total: easyTotal },
        medium: { solved: mediumSolved, total: mediumTotal },
        hard: { solved: hardSolved, total: hardTotal },
        recentSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/submissions/admin-analytics (Admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalCategories,
      totalSubmissions,
      acceptedSubmissions,
      recentSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Category.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'Accepted' }),
      Submission.find()
        .populate('user', 'name email')
        .populate('question', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(15)
    ]);

    const acceptanceRate = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalQuestions,
        totalCategories,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate,
        recentSubmissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
