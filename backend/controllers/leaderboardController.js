import User from '../models/User.js';
import Submission from '../models/Submission.js';

// @route GET /api/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '' } = req.query;

    // Fetch active users with solved questions populated
    const users = await User.find({ isBlocked: { $ne: true } })
      .select('name email role avatar dailyStreak maxStreak lastLoginDate createdAt solvedQuestions')
      .populate('solvedQuestions', 'title difficulty category')
      .lean();

    // Fetch submission statistics per user for accuracy rate
    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: '$user',
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          }
        }
      }
    ]);

    const subMap = new Map();
    submissionStats.forEach(s => {
      if (s._id) {
        subMap.set(s._id.toString(), s);
      }
    });

    // Score weight constants
    const EASY_POINTS = 10;
    const MEDIUM_POINTS = 25;
    const HARD_POINTS = 50;
    const STREAK_POINTS = 15; // 15 points per active daily streak day

    // Process each user and calculate global ranking score
    let rankedUsers = users.map(user => {
      const solvedList = user.solvedQuestions || [];
      
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;

      solvedList.forEach(q => {
        if (q && q.difficulty) {
          const diff = q.difficulty.toLowerCase();
          if (diff === 'easy') easyCount++;
          else if (diff === 'medium') mediumCount++;
          else if (diff === 'hard') hardCount++;
        }
      });

      const totalSolved = solvedList.length;
      const streak = user.dailyStreak || 1;
      const maxStreak = user.maxStreak || streak;

      // Composite Score: Right Answers Weight + Login Streak Weight
      const problemScore = (easyCount * EASY_POINTS) + (mediumCount * MEDIUM_POINTS) + (hardCount * HARD_POINTS);
      const streakScore = streak * STREAK_POINTS;
      const totalScore = problemScore + streakScore;

      const subData = subMap.get(user._id.toString()) || { totalSubmissions: 0, acceptedSubmissions: 0 };
      const accuracy = subData.totalSubmissions > 0
        ? Math.round((subData.acceptedSubmissions / subData.totalSubmissions) * 100)
        : 100;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        dailyStreak: streak,
        maxStreak,
        lastLoginDate: user.lastLoginDate,
        createdAt: user.createdAt,
        easyCount,
        mediumCount,
        hardCount,
        totalSolved,
        totalScore,
        problemScore,
        streakScore,
        accuracy,
        totalSubmissions: subData.totalSubmissions
      };
    });

    // Sort users descending by totalScore, then totalSolved, then dailyStreak
    rankedUsers.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
      if (b.dailyStreak !== a.dailyStreak) return b.dailyStreak - a.dailyStreak;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Assign rank #1, #2, #3...
    rankedUsers = rankedUsers.map((u, index) => ({
      ...u,
      rank: index + 1
    }));

    // Find current user's rank if auth token header is present
    let currentUserRank = null;
    if (req.user) {
      const found = rankedUsers.find(u => u._id.toString() === req.user._id.toString());
      if (found) {
        currentUserRank = found;
      }
    }

    // Top highlights for statistics banner
    const topStreakUser = rankedUsers.reduce((prev, curr) => (curr.dailyStreak > (prev?.dailyStreak || 0) ? curr : prev), null);
    const topSolverUser = rankedUsers.reduce((prev, curr) => (curr.totalSolved > (prev?.totalSolved || 0) ? curr : prev), null);
    const totalAcceptedGlobal = rankedUsers.reduce((sum, u) => sum + u.totalSolved, 0);

    // Apply Search filter if specified
    let filtered = rankedUsers;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = rankedUsers.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedUsers = filtered.slice(startIndex, startIndex + limitNum);

    // Podium Top 3 (from overall unfiltered leaderboard)
    const topThree = rankedUsers.slice(0, 3);

    res.json({
      success: true,
      leaderboard: paginatedUsers,
      topThree,
      totalUsers: rankedUsers.length,
      page: pageNum,
      totalPages,
      totalItems,
      currentUserRank,
      stats: {
        totalLearners: rankedUsers.length,
        totalAcceptedGlobal,
        topStreak: topStreakUser ? topStreakUser.dailyStreak : 0,
        topSolverCount: topSolverUser ? topSolverUser.totalSolved : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
