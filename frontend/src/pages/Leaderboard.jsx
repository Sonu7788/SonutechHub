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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SEO
        title="Global Leaderboard - Free Java DSA Practice Rankings"
        description="View top rankers on SonuTechHub. Compete globally on the free Java DSA practice platform based on accepted solutions, difficulty points, and daily login streaks."
        keywords="Free DSA Practice Platform Online Leaderboard, Java DSA Rankings, Code Streak, Top Java Coders, SonuTechHub Global Standings"
      />

      {/* Header Banner */}
      <div className="clean-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-50/70 via-white to-amber-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-blue-600" /> 100% Free DSA Practice Platform Rankings
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Global Coding Leaderboard
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Earn ranking points by submitting verified Java solutions (<span className="text-emerald-600 font-bold">Easy +10</span>, <span className="text-amber-600 font-bold">Medium +25</span>, <span className="text-rose-600 font-bold">Hard +50</span>) and maintaining your daily login streak (<span className="text-orange-500 font-bold">🔥 +15 pts/day</span>).
            </p>
          </div>

          {/* Platform Stat Badges */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-xl font-black text-blue-600 font-mono">{stats.totalLearners}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-slate-400" /> Coders
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-xl font-black text-emerald-600 font-mono">{stats.totalAcceptedGlobal}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400" /> Solved
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-xl font-black text-orange-500 font-mono flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-orange-500" /> {stats.topStreak}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Top Streak</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-xl font-black text-amber-500 font-mono flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 fill-amber-500" /> {stats.topSolverCount}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Max Solved</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {topThree.length >= 3 && !currentSearch && currentPage === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500" /> Hall of Champions
            </h2>
            <p className="text-xs text-slate-500">Top performers leading the global SonuTechHub ranks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-6">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1 clean-card rounded-3xl p-6 bg-gradient-to-b from-slate-50 to-white text-center relative border-slate-300 transform md:translate-y-2 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm mx-auto -mt-10 border-2 border-white shadow-md">
                2
              </div>
              <div className="mt-3 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                  {topThree[1]?.name?.[0]?.toUpperCase() || '2'}
                </div>
                <h3 className="font-bold text-slate-900 text-base truncate">{topThree[1]?.name}</h3>
                <div className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {topThree[1]?.dailyStreak} Day Streak
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                  <div>
                    <div className="text-emerald-600 font-mono font-bold text-sm">{topThree[1]?.totalSolved}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Solved</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <div className="text-blue-600 font-mono font-bold text-sm">{topThree[1]?.totalScore}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold - Elevated) */}
            <div className="order-1 md:order-2 clean-card rounded-3xl p-7 bg-gradient-to-b from-amber-50 via-white to-amber-50/30 text-center relative border-amber-300 shadow-md">
              <div className="w-11 h-11 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base mx-auto -mt-12 border-2 border-white shadow-md">
                👑 1
              </div>
              <div className="mt-4 space-y-2">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-2xl flex items-center justify-center mx-auto shadow-sm w-16 h-16">
                  {topThree[0]?.name?.[0]?.toUpperCase() || '1'}
                </div>
                <h3 className="font-black text-slate-900 text-lg truncate">{topThree[0]?.name}</h3>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {topThree[0]?.dailyStreak} Day Streak 🔥
                </div>
                <div className="pt-3 flex items-center justify-center gap-6 text-xs">
                  <div>
                    <div className="text-emerald-600 font-mono font-black text-base">{topThree[0]?.totalSolved}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Solved</div>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <div className="text-blue-600 font-mono font-black text-base">{topThree[0]?.totalScore}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3 clean-card rounded-3xl p-6 bg-gradient-to-b from-orange-50/50 to-white text-center relative border-orange-200 transform md:translate-y-4 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-bold text-sm mx-auto -mt-10 border-2 border-white shadow-md">
                3
              </div>
              <div className="mt-3 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                  {topThree[2]?.name?.[0]?.toUpperCase() || '3'}
                </div>
                <h3 className="font-bold text-slate-900 text-base truncate">{topThree[2]?.name}</h3>
                <div className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {topThree[2]?.dailyStreak} Day Streak
                </div>
                <div className="pt-2 flex items-center justify-center gap-4 text-xs">
                  <div>
                    <div className="text-emerald-600 font-mono font-bold text-sm">{topThree[2]?.totalSolved}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Solved</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <div className="text-blue-600 font-mono font-bold text-sm">{topThree[2]?.totalScore}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logged in User Current Rank Card */}
      {user && currentUserRank && (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Your Current Standing</div>
              <div className="text-sm font-bold text-slate-900">{currentUserRank.name} ({currentUserRank.email})</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-orange-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-orange-500" /> {currentUserRank.dailyStreak} Day Streak
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" /> {currentUserRank.totalSolved} Solved
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-black bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-blue-600" /> {currentUserRank.totalScore} Pts
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Medal className="w-4 h-4 text-blue-600" />
            Full Standings ({totalItems} participants)
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
          </form>
        </div>

        <div className="clean-card rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3" />
              <p className="text-xs text-slate-500">Loading global leaderboard standings...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No participants found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search keywords.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 w-16 text-center font-semibold">Rank</th>
                      <th className="py-3.5 px-4 font-semibold">User</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Daily Streak</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Solved Breakdown</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Total Solved</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Accuracy</th>
                      <th className="py-3.5 px-4 text-right font-semibold">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.map((item) => {
                      const isMe = user && (user._id === item._id || user.id === item._id);
                      return (
                        <tr
                          key={item._id}
                          className={`transition-colors ${
                            isMe 
                              ? 'bg-blue-50/60 hover:bg-blue-50/80' 
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Rank badge */}
                          <td className="py-4 px-4 text-center font-mono font-bold">
                            {item.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-black shadow-sm">
                                🥇 1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-xs font-black shadow-sm">
                                🥈 2
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-800 border border-orange-300 text-xs font-black shadow-sm">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs font-bold">#{item.rank}</span>
                            )}
                          </td>

                          {/* User info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                                {item.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  {item.name}
                                  {isMe && (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                                      You
                                    </span>
                                  )}
                                  {item.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                                  {item.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Daily Login Streak */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                              <Flame className="w-3.5 h-3.5 fill-orange-500" /> {item.dailyStreak} {item.dailyStreak === 1 ? 'day' : 'days'}
                            </span>
                          </td>

                          {/* Difficulty Breakdown */}
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" title="Easy Solved">
                                E: {item.easyCount}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold" title="Medium Solved">
                                M: {item.mediumCount}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold" title="Hard Solved">
                                H: {item.hardCount}
                              </span>
                            </div>
                          </td>

                          {/* Total Solved */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {item.totalSolved}
                            </span>
                          </td>

                          {/* Accuracy */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-xs font-mono font-medium text-slate-600">
                              {item.accuracy}%
                            </span>
                          </td>

                          {/* Total Score */}
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center gap-1 font-mono font-black text-blue-600 text-sm">
                              <Zap className="w-3.5 h-3.5 fill-blue-600" />
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
              <div className="border-t border-slate-200 px-4 py-2 bg-slate-50/50">
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

