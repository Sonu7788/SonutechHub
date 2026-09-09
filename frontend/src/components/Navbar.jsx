import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  ShieldAlert, 
  User, 
  LogOut, 
  LogIn, 
  ChevronDown,
  BookOpen,
  Trophy,
  BarChart2,
  Flame
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPracticeActive = location.pathname === '/practice' || location.pathname.startsWith('/problem');
  const isLeaderboardActive = location.pathname === '/leaderboard';
  const isBeginnerActive = location.search.includes('difficulty=Easy');

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform text-white font-mono font-bold text-base">
                &lt;/&gt;
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                    SonuTech <span className="text-blue-600">Hub</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70">
                    FREE DSA
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Code • Practice • Excel</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center space-x-1.5 ml-4">
              <Link
                to="/practice"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isPracticeActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isPracticeActive ? 'text-blue-600' : 'text-slate-500'}`} />
                Practice Track
              </Link>
              <Link
                to="/leaderboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isLeaderboardActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </Link>
              <Link
                to="/practice?difficulty=Easy"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isBeginnerActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-blue-500" />
                Beginner Track
              </Link>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Daily Streak Badge */}
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user?.dailyStreak || 2} days streak</span>
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors text-xs font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.[0]?.toUpperCase() || 'D'}
                  </div>
                  <span className="font-semibold max-w-[120px] truncate">{user?.name || 'Demo Student'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="text-blue-600 font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          {user?.solvedQuestions?.length || 0} Solved
                        </span>
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          {user?.dailyStreak || 2}d Streak
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      My Profile & Stats
                    </Link>

                    <Link
                      to="/leaderboard"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Global Leaderboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Admin Manager
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
