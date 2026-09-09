import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, questionAPI } from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  Code2, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Zap, 
  FolderCode,
  BookOpen,
  Trophy,
  Flame
} from 'lucide-react';
import SEO from '../components/SEO';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredQuestions, setFeaturedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, qRes] = await Promise.all([
          categoryAPI.getAll(),
          questionAPI.getAll({ limit: 6 })
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (qRes.data.success) {
          setFeaturedQuestions(qRes.data.questions);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      <SEO
        title="Free DSA Practice Platform Online - Free Java Compiler & Coding"
        description="SonuTechHub is the 100% free DSA practice platform online. Master Java Data Structures & Algorithms topic by topic (Arrays, DP, Trees, Graphs) with real-time compilation, test verification, and global leaderboards."
        keywords="Free DSA Practice Platform Online, Free Java DSA Practice, Online Java Compiler, Java Coding Interview Preparation, Free DSA Practice, Java Data Structures Platform, SonuTechHub Leaderboard"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-12 lg:pt-16 lg:pb-16 bg-gradient-to-b from-blue-50/60 via-white to-transparent border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide mb-6">
            <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" /> 100% Free DSA Practice Platform Online
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Master Data Structures & Algorithms <br className="hidden sm:inline" />
            on <span className="text-blue-600">SonuTechHub</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Interactive Java DSA practice platform. Write, compile, and execute Java code directly in your browser with real-time test case validation, daily login streaks, and global rankings.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Practice Track
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Global Leaderboard
            </Link>
          </div>

          {/* Metrics */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-blue-600">{categories.length || 8}+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Core DSA Tracks</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-emerald-600">100% Free</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">No Paywall Ever</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-indigo-600">Java 24</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Native Compiler</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl font-black text-amber-500">Global</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Daily Streak Ranks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Practice Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              DSA Category Tracks
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to practice curated problems with tailored test suites.
            </p>
          </div>
          <Link
            to="/practice"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            View All Topics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((category) => {
              const stats = category.questionStats || { total: 0, easy: 0, medium: 0, hard: 0 };
              return (
                <Link
                  key={category._id}
                  to={`/practice?category=${category.slug}`}
                  className="clean-card rounded-2xl p-5 flex flex-col justify-between group hover:border-blue-400 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 transition-colors">
                        <FolderCode className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {stats.total} Problems
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {category.description || 'Practice fundamental data structures and algorithmic patterns.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                    <span className="text-emerald-600">{stats.easy} Easy</span>
                    <span className="text-amber-600">{stats.medium} Med</span>
                    <span className="text-rose-600">{stats.hard} Hard</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Questions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="clean-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Featured Java Problems
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Jump into popular coding interview problems asked by top tech firms.
              </p>
            </div>
            <Link
              to="/practice"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Solve More
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Problem Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Difficulty</th>
                  <th className="py-3 px-4 font-semibold">Tags</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {featuredQuestions.map((q) => (
                  <tr key={q._id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      <Link to={`/problem/${q._id}`} className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600">{q.title}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {q.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={q.difficulty} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(q.tags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/problem/${q._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Solve →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

