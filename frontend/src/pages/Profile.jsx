import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DifficultyBadge from '../components/DifficultyBadge';
import Pagination from '../components/Pagination';
import { 
  User, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Code2, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubId, setExpandedSubId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [subPage, setSubPage] = useState(1);
  const subPageSize = 8;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await submissionAPI.getMyStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const easyPct = stats?.easy.total ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0;
  const medPct = stats?.medium.total ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0;
  const hardPct = stats?.hard.total ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Bio Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-emerald-600/20">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Trophy className="w-3.5 h-3.5" /> {stats?.totalSolved || 0} Problems Solved
              </span>
              <span>•</span>
              <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <Link
          to="/practice"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
        >
          Continue Practice Track
        </Link>
      </div>

      {/* Progress Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Easy */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Easy Problems</span>
            <span className="text-sm font-mono font-bold text-white">
              {stats?.easy.solved} / {stats?.easy.total}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${easyPct}%` }} />
          </div>
          <div className="text-[11px] text-gray-400 text-right">{easyPct}% solved</div>
        </div>

        {/* Medium */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Medium Problems</span>
            <span className="text-sm font-mono font-bold text-white">
              {stats?.medium.solved} / {stats?.medium.total}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${medPct}%` }} />
          </div>
          <div className="text-[11px] text-gray-400 text-right">{medPct}% solved</div>
        </div>

        {/* Hard */}
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Hard Problems</span>
            <span className="text-sm font-mono font-bold text-white">
              {stats?.hard.solved} / {stats?.hard.total}
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${hardPct}%` }} />
          </div>
          <div className="text-[11px] text-gray-400 text-right">{hardPct}% solved</div>
        </div>
      </div>

      {/* Recent Submissions List with Expandable Java Code */}
      <div className="rounded-3xl bg-gray-900/80 border border-gray-800 p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Your Submission History & Saved Code</h3>
        {stats?.recentSubmissions?.length === 0 ? (
          <p className="text-xs text-gray-400">No submissions recorded yet. Pick a problem from the practice track and submit your Java solution!</p>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-gray-800">
              {stats?.recentSubmissions?.slice((subPage - 1) * subPageSize, subPage * subPageSize).map((sub) => {
                const isExpanded = expandedSubId === sub._id;
                return (
                  <div key={sub._id} className="py-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <Link
                            to={`/problem/${sub.question?._id}`}
                            className="font-semibold text-white hover:text-emerald-400 transition-colors text-sm"
                          >
                            {sub.question?.title}
                          </Link>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(sub.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          sub.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {sub.status}
                        </span>
                        <span className="font-mono text-gray-400">{sub.executionTimeMs} ms</span>
                        
                        <button
                          onClick={() => setExpandedSubId(isExpanded ? null : sub._id)}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          {isExpanded ? 'Hide Code' : 'View Code'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Submitted Code Box */}
                    {isExpanded && (
                      <div className="p-4 rounded-2xl bg-black/80 border border-gray-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span className="font-mono">Submitted Java Solution:</span>
                          <button
                            onClick={() => handleCopyCode(sub._id, sub.code)}
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                          >
                            {copiedId === sub._id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === sub._id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-gray-950 font-mono text-xs text-emerald-300 overflow-x-auto border border-gray-800/80 whitespace-pre-wrap max-h-72">
                          {sub.code}
                        </pre>
                        <div className="text-right">
                          <Link
                            to={`/problem/${sub.question?._id}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                          >
                            Open in Workspace <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            {stats?.recentSubmissions?.length > subPageSize && (
              <div className="border-t border-gray-800 pt-2">
                <Pagination
                  currentPage={subPage}
                  totalPages={Math.ceil((stats?.recentSubmissions?.length || 0) / subPageSize)}
                  totalItems={stats?.recentSubmissions?.length || 0}
                  pageSize={subPageSize}
                  onPageChange={setSubPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
