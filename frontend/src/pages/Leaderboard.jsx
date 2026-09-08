import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import SEO from '../components/SEO';
import { 
  Trophy, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Crown, 
  Medal, 
  Search, 
  Users, 
  Sparkles, 
  ArrowRight,
  Target,
  ShieldCheck
} from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [leaderboard, setLeaderboard] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(currentSearch);
  const pageSize = 15;

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage, currentSearch]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await leaderboardAPI.getLeaderboard({
        page: currentPage,
        limit: pageSize,
        search: currentSearch || undefined
      });
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
        setTopThree(res.data.topThree || []);
        setStats(res.data.stats);
        setTotalItems(res.data.totalItems || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.currentUserRank) {
          setCurrentUserRank(res.data.currentUserRank);
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newParams.set('page', newPage);
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEO
        title="Global Leaderboard - Free Java DSA Practice Rankings"
        description="View top rankers on SonuTechHub. Compete globally on the free Java DSA practice platform based on accepted solutions, difficulty points, and daily login streaks."
        keywords="Free DSA Practice Platform Online Leaderboard, Java DSA Rankings, Code Streak, Top Java Coders, SonuTechHub Global Standings"
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-gray-900 to-amber-950/40 border border-gray-800 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" /> 100% Free DSA Practice Platform Rankings
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Global Coding Leaderboard
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Earn ranking points by submitting verified Java solutions (<span className="text-emerald-400 font-semibold">Easy +10</span>, <span className="text-amber-400 font-semibold">Medium +25</span>, <span className="text-rose-400 font-semibold">Hard +50</span>) and maintaining your daily login streak (<span className="text-orange-400 font-semibold">🔥 +15 pts/day</span>).
            </p>
          </div>

          {/* Platform Stat Badges */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 text-center">
                <div className="text-xl font-extrabold text-emerald-400 font-mono">{stats.totalLearners}</div>
                <div className="text-[10px] text-gray-400 uppercase font-medium flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" /> Coders
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 text-center">
                <div className="text-xl font-extrabold text-blue-400 font-mono">{stats.totalAcceptedGlobal}</div>
                <div className="text-[10px] text-gray-400 uppercase font-medium flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 text-center">
                <div className="text-xl font-extrabold text-orange-400 font-mono flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-400" /> {stats.topStreak}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">Top Streak</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800 text-center">
                <div className="text-xl font-extrabold text-amber-400 font-mono flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-400" /> {stats.topSolverCount}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">Max Solved</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {topThree.length >= 3 && !currentSearch && currentPage === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" /> Hall of Champions
            </h2>
            <p className="text-xs text-gray-400">Top performers leading the global SonuTechHub ranks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1 glass-card rounded-3xl p-6 border border-slate-700/80 bg-gradient-to-b from-slate-800/40 to-gray-900/80 text-center relative shadow-xl transform md:translate-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-base mx-auto -mt-11 border-2 border-slate-400 shadow-md">
                2
              </div>
              <div className="mt-3 space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-400 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg">
                  {topThree[1]?.name?.[0]?.toUpperCase() || '2'}
                </div>
                <h3 className="font-bold text-white text-base truncate">{topThree[1]?.name}</h3>
                <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" /> {topThree[1]?.dailyStreak} Day Streak
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                  <div>
                    <div className="text-emerald-400 font-mono font-bold text-sm">{topThree[1]?.totalSolved}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Solved</div>
                  </div>
                  <div className="h-6 w-px bg-gray-800" />
                  <div>
                    <div className="text-amber-400 font-mono font-bold text-sm">{topThree[1]?.totalScore}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold - Elevated) */}
            <div className="order-1 md:order-2 glass-card rounded-3xl p-7 border border-amber-500/50 bg-gradient-to-b from-amber-500/20 via-amber-950/20 to-gray-900/90 text-center relative shadow-2xl shadow-amber-500/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 flex items-center justify-center font-extrabold text-lg mx-auto -mt-13 border-2 border-yellow-300 shadow-lg shadow-amber-500/30">
                👑 1
              </div>
              <div className="mt-4 space-y-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-gray-950 font-black text-2xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
                  {topThree[0]?.name?.[0]?.toUpperCase() || '1'}
                </div>
                <h3 className="font-extrabold text-white text-lg truncate">{topThree[0]?.name}</h3>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" /> {topThree[0]?.dailyStreak} Day Streak 🔥
                </div>
                <div className="pt-3 flex items-center justify-center gap-6 text-xs">
                  <div>
                    <div className="text-emerald-400 font-mono font-extrabold text-base">{topThree[0]?.totalSolved}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Solved</div>
                  </div>
                  <div className="h-7 w-px bg-gray-800" />
                  <div>
                    <div className="text-amber-400 font-mono font-extrabold text-base">{topThree[0]?.totalScore}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 glass-card rounded-3xl p-6 border border-amber-800/60 bg-gradient-to-b from-amber-900/30 to-gray-900/80 text-center relative shadow-xl transform md:translate-y-4">
              <div className="w-10 h-10 rounded-full bg-amber-800 text-amber-200 flex items-center justify-center font-bold text-base mx-auto -mt-11 border-2 border-amber-600 shadow-md">
                3
              </div>
              <div className="mt-3 space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg">
                  {topThree[2]?.name?.[0]?.toUpperCase() || '3'}
                </div>
                <h3 className="font-bold text-white text-base truncate">{topThree[2]?.name}</h3>
                <div className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" /> {topThree[2]?.dailyStreak} Day Streak
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                  <div>
                    <div className="text-emerald-400 font-mono font-bold text-sm">{topThree[2]?.totalSolved}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Solved</div>
                  </div>
                  <div className="h-6 w-px bg-gray-800" />
                  <div>
                    <div className="text-amber-400 font-mono font-bold text-sm">{topThree[2]?.totalScore}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logged in User Current Rank Card */}
      {user && currentUserRank && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Your Current Standing</div>
              <div className="text-sm font-bold text-white">{currentUserRank.name} ({currentUserRank.email})</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              <Flame className="w-4 h-4 fill-orange-400" /> {currentUserRank.dailyStreak} Day Streak
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> {currentUserRank.totalSolved} Solved
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
              <Zap className="w-4 h-4 fill-amber-400" /> {currentUserRank.totalScore} Pts
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-400" />
            Full Standings ({totalItems} participants)
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </form>
        </div>

        <div className="rounded-2xl bg-gray-900/70 border border-gray-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-3" />
              <p className="text-xs text-gray-400">Loading global leaderboard standings...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No participants found</h3>
              <p className="text-xs text-gray-400">Try adjusting your search keywords.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] text-gray-400 uppercase bg-gray-950/60 border-b border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4 text-center">Daily Streak</th>
                      <th className="py-3.5 px-4 text-center">Solved Breakdown</th>
                      <th className="py-3.5 px-4 text-center">Total Solved</th>
                      <th className="py-3.5 px-4 text-center">Accuracy</th>
                      <th className="py-3.5 px-4 text-right">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {leaderboard.map((item) => {
                      const isMe = user && (user._id === item._id || user.id === item._id);
                      return (
                        <tr
                          key={item._id}
                          className={`transition-colors ${
                            isMe 
                              ? 'bg-emerald-950/30 hover:bg-emerald-950/50' 
                              : 'hover:bg-gray-800/30'
                          }`}
                        >
                          {/* Rank badge */}
                          <td className="py-4 px-4 text-center font-mono font-bold">
                            {item.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs shadow-sm">
                                🥇 1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40 text-xs shadow-sm">
                                🥈 2
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/20 text-amber-400 border border-amber-700/40 text-xs shadow-sm">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">#{item.rank}</span>
                            )}
                          </td>

                          {/* User info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 text-emerald-400 font-bold text-xs flex items-center justify-center border border-gray-700">
                                {item.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                                  {item.name}
                                  {isMe && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                      You
                                    </span>
                                  )}
                                  {item.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">
                                  {item.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Daily Login Streak */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                              <Flame className="w-3.5 h-3.5 fill-orange-400" /> {item.dailyStreak} {item.dailyStreak === 1 ? 'day' : 'days'}
                            </span>
                          </td>

                          {/* Difficulty Breakdown */}
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold" title="Easy Solved">
                                E: {item.easyCount}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold" title="Medium Solved">
                                M: {item.mediumCount}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold" title="Hard Solved">
                                H: {item.hardCount}
                              </span>
                            </div>
                          </td>

                          {/* Total Solved */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono font-bold text-white text-xs">
                              {item.totalSolved}
                            </span>
                          </td>

                          {/* Accuracy */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-xs font-mono text-gray-300">
                              {item.accuracy}%
                            </span>
                          </td>

                          {/* Total Score */}
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-mono font-extrabold text-amber-400 text-sm">
                              <Zap className="w-3.5 h-3.5 fill-amber-400" />
                              {item.totalScore}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="border-t border-gray-800 px-4 py-2 bg-gray-950/40">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
