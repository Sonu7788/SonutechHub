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
  FileSpreadsheet, 
  Cpu, 
  Play, 
  Zap, 
  Compass,
  FolderCode
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
        title="Master Java DSA & Coding Practice"
        description="Master Java Data Structures & Algorithms topic by topic. Practice Arrays, Linked Lists, Trees, Graphs, DP with an interactive Java 24 in-browser compiler."
        keywords="Java DSA, SonuTechHub, Java Algorithms, Coding Interview Java, DSA Practice Track, Online Java Compiler"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Zap className="w-3.5 h-3.5" /> SonuTechHub • High Speed Java 24 Sandbox
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Elevate Your Coding with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">SonuTechHub</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Practice curated Data Structures & Algorithms topic by topic. Write, compile, and execute Java code directly in the browser with real-time test case verification.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Practicing Now
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Admin Portal
            </Link>
          </div>

          {/* Metrics */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400 font-mono">{categories.length || 8}+</div>
              <div className="text-xs text-gray-400 mt-1">Core DSA Topics</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-400 font-mono">100%</div>
              <div className="text-xs text-gray-400 mt-1">Java Native Runner</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400 font-mono">&lt; 500ms</div>
              <div className="text-xs text-gray-400 mt-1">Execution Speed</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400 font-mono">Excel/CSV</div>
              <div className="text-xs text-gray-400 mt-1">Bulk Question Import</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Practice Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Layers className="w-7 h-7 text-emerald-400" />
              DSA Category Tracks
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Select a category to practice curated problems with tailored hints & test suites.
            </p>
          </div>
          <Link
            to="/practice"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group"
          >
            View All Topics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-gray-800/40 animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const stats = category.questionStats || { total: 0, easy: 0, medium: 0, hard: 0 };
              return (
                <Link
                  key={category._id}
                  to={`/practice?category=${category.slug}`}
                  className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700/60 group-hover:border-emerald-500/50 transition-colors">
                        <FolderCode className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-gray-800/80 text-gray-300 border border-gray-700/50">
                        {stats.total} Problems
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {category.description || 'Practice fundamental data structures and algorithmic patterns.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400">{stats.easy} Easy</span>
                    <span className="text-amber-400">{stats.medium} Med</span>
                    <span className="text-rose-400">{stats.hard} Hard</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Questions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-gray-900/80 to-gray-950/80 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                Featured Java Problems
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Jump into popular coding interview problems asked by top tech firms.
              </p>
            </div>
            <Link
              to="/practice"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
            >
              Solve More
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Problem Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {featuredQuestions.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="py-4 px-4 font-medium text-white group-hover:text-emerald-400 transition-colors">
                      <Link to={`/problem/${q._id}`} className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
                        {q.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-xs">
                      <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
                        {q.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <DifficultyBadge difficulty={q.difficulty} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(q.tags || []).slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-gray-800/60 text-gray-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/problem/${q._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        Solve <ArrowRight className="w-3.5 h-3.5" />
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
