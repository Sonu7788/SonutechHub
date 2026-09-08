import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  Terminal, 
  ShieldAlert, 
  User, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Layers, 
  ChevronDown,
  BookOpen,
  Trophy,
  Flame
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  SonuTech<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Hub</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Free DSA
                  </span>
                </span>
                <span className="text-[10px] text-gray-400 -mt-1 font-mono">Code • Practice • Excel</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/practice"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                Practice Track
              </Link>
              <Link
                to="/leaderboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard
              </Link>
              <Link
                to="/practice?difficulty=Easy"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
              >
                Beginner Track
              </Link>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span>{user?.dailyStreak || 1} {user?.dailyStreak === 1 ? 'day' : 'days'} streak</span>
              </div>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-800 text-gray-200 border border-gray-700/60 transition-colors text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#1e293b] border border-gray-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-700/70">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {user?.solvedQuestions?.length || 0} Solved
                        </span>
                        <span className="text-orange-400 flex items-center gap-1 font-semibold">
                          <Flame className="w-3 h-3 fill-orange-400" />
                          {user?.dailyStreak || 1}d Streak
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    >
                      <User className="w-4 h-4 text-blue-400" />
                      My Profile & Stats
                    </Link>

                    <Link
                      to="/leaderboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Global Leaderboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/10"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Manager
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
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
