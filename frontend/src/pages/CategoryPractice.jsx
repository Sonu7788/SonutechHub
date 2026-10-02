import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { categoryAPI, questionAPI, patternAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DifficultyBadge from '../components/DifficultyBadge';
import Pagination from '../components/Pagination';
import { 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  Code2, 
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  ChevronDown,
  Target,
  BarChart3,
  Zap,
  TrendingUp,
  BarChart2,
  Trophy,
  Flame,
  LayoutList,
  Quote,
  Check,
  FileText,
  Copy,
  Clock,
  HardDrive,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

export default function CategoryPractice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Active Main View: 'problems' or 'patterns'
  const activeView = searchParams.get('tab') === 'patterns' ? 'patterns' : 'problems';
  const currentCategory = searchParams.get('category') || '';
  const currentDifficulty = searchParams.get('difficulty') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const pageSize = 10;

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedPatternId, setSelectedPatternId] = useState(null);

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory || undefined,
          difficulty: currentDifficulty !== 'All' ? currentDifficulty : undefined,
          search: currentSearch || undefined,
          page: currentPage,
          limit: pageSize
        };
        const res = await questionAPI.getAll(params);
        if (res.data.success) {
          setQuestions(res.data.questions);
          setTotal(res.data.total);
        }
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentCategory, currentDifficulty, currentSearch, currentPage]);

  // 3. Fetch Patterns / Study Notes
  useEffect(() => {
    const fetchPatterns = async () => {
      setPatternsLoading(true);
      try {
        const params = {
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          difficulty: currentDifficulty !== 'All' ? currentDifficulty : undefined
        };
        const res = await patternAPI.getAll(params);
        if (res.data.success) {
          setPatterns(res.data.patterns || []);
        }
      } catch (err) {
        console.error('Failed to load patterns', err);
      } finally {
        setPatternsLoading(false);
      }
    };

    fetchPatterns();
  }, [currentCategory, currentSearch, currentDifficulty]);

  const handleTabToggle = (tabName) => {
    const newParams = new URLSearchParams(searchParams);
    if (tabName === 'patterns') {
      newParams.set('tab', 'patterns');
    } else {
      newParams.delete('tab');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (!slug) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
    setMoreDropdownOpen(false);
  };

  const handleDifficultySelect = (diff) => {
    const newParams = new URLSearchParams(searchParams);
    if (diff === 'All') {
      newParams.delete('difficulty');
    } else {
      newParams.set('difficulty', diff);
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.delete('page'); // Reset to page 1
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

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const isSolved = (questionId) => {
    if (!user?.solvedQuestions) return false;
    return user.solvedQuestions.some(q => (typeof q === 'string' ? q : q._id) === questionId);
  };

  const solvedCount = user?.solvedQuestions?.length || 50;
  const totalCount = total || 202;
  const progressPercent = Math.min(Math.round((solvedCount / (totalCount || 1)) * 100), 100) || 25;

  const visibleCategories = categories.slice(0, 10);
  const overflowCategories = categories.slice(10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <SEO
        title={currentCategory ? `${categories.find(c => c.slug === currentCategory)?.name || currentCategory} Practice Track & Patterns` : 'Java DSA Practice Track & Patterns - SonuTechHub'}
        description={`Master Java Data Structures & Algorithms with curated problems, algorithmic pattern notes (Two Pointers, Sliding Window), and OpenJDK 24 compiler verification.`}
        keywords={`Java DSA Practice, DSA Patterns, Two Pointers Pattern, Sliding Window Pattern, Java Coding Questions, ${currentCategory || 'Arrays, Strings, Trees, Dynamic Programming'}`}
      />

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/70 via-white to-sky-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Title & Metrics */}
          <div className="space-y-4 max-w-2xl">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full shrink-0" />
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Java <span className="text-blue-600">DSA</span> Practice Track & Patterns
                </h1>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-normal mt-1.5">
                Master Data Structures & Algorithms with curated problems, in-depth pattern study notes, and test cases.
              </p>
            </div>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">200+ Problems</div>
                  <div className="text-[10px] text-slate-400">Handpicked for you</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Pattern Notes</div>
                  <div className="text-[10px] text-slate-400">Multi-code examples</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Java 24</div>
                  <div className="text-[10px] text-slate-400">Native Compiler</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Track Progress</div>
                  <div className="text-[10px] text-slate-400">Improve every day</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="hidden lg:flex items-center justify-end gap-5">
            <div className="relative">
              <div className="w-44 h-28 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-3 text-white shadow-xl shadow-blue-500/25 flex flex-col justify-between transform rotate-[-4deg] hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] opacity-80 font-mono">
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                    <span className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20">PATTERNS</span>
                </div>
                <div className="text-center font-mono text-2xl font-bold tracking-widest text-white/90">
                  &lt;/&gt;
                </div>
                <div className="text-[10px] font-medium opacity-80 text-right">
                  SonuTechHub
                </div>
              </div>
            </div>

            <div className="space-y-1 font-serif italic text-xs text-slate-600 border-l border-blue-200 pl-3">
              <div>Patterns</div>
              <div>Practice</div>
              <div>Solve</div>
              <div className="font-bold text-blue-600">Excel</div>
            </div>
          </div>

        </div>
      </div>

      {/* Category Topic Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {/* All Topics Pill */}
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-xs shrink-0 ${
            !currentCategory
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>All Topics</span>
        </button>

        {/* Dynamic Category Pills */}
        {visibleCategories.map((cat) => {
          const isSelected = currentCategory === cat.slug;
          return (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 shadow-xs shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-blue-500/20 font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                {cat.questionStats?.total || 10}
              </span>
            </button>
          );
        })}

        {/* More Dropdown if there are more categories */}
        {overflowCategories.length > 0 && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 shadow-xs"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {moreDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-40 max-h-60 overflow-y-auto">
                {overflowCategories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-bold">
                      {cat.questionStats?.total || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (70% - lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            
            {/* Main Tabs Navigation Header: Problems vs Patterns */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => handleTabToggle('problems')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeView === 'problems'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Problems ({total})</span>
                </button>

                <button
                  onClick={() => handleTabToggle('patterns')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeView === 'patterns'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Patterns & Notes ({patterns.length})</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-1">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                    const isActive = currentDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => handleDifficultySelect(diff)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </form>
              </div>
            </div>

            {/* TAB VIEW 1: PROBLEMS TABLE */}
            {activeView === 'problems' && (
              <>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3" />
                    <p className="text-xs text-slate-400">Loading Java DSA problems...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No questions found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Try adjusting your category or difficulty filter, or switch to the Patterns tab.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4 w-10 text-center">#</th>
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Tags</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {questions.map((q, idx) => {
                          const solved = isSolved(q._id);
                          return (
                            <tr
                              key={q._id}
                              className="hover:bg-blue-50/30 transition-colors group"
                            >
                              <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                                {solved ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto inline" />
                                ) : (
                                  (currentPage - 1) * pageSize + idx + 1
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-xs sm:text-sm">
                                <Link
                                  to={`/problem/${q._id}`}
                                  className="group-hover:text-blue-600 transition-colors"
                                >
                                  {q.title}
                                </Link>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">
                                  {q.category?.name || 'DSA'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <DifficultyBadge difficulty={q.difficulty} size="sm" />
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {(q.tags || []).slice(0, 2).map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <Link
                                  to={`/problem/${q._id}`}
                                  className="inline-flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs hover:scale-105"
                                >
                                  Solve <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Footer */}
                {total > pageSize && (
                  <div className="border-t border-slate-100 px-4 py-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(total / pageSize)}
                      totalItems={total}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {/* TAB VIEW 2: PATTERNS & STUDY NOTES */}
            {activeView === 'patterns' && (
              <div className="p-5 space-y-6">
                {patternsLoading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3" />
                    <p className="text-xs text-slate-400">Loading DSA Patterns & Study Notes...</p>
                  </div>
                ) : patterns.length === 0 ? (
                  <div className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No patterns found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Select a different category or search term to discover curated DSA pattern notes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {patterns.map((pat) => (
                      <div
                        key={pat._id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6 hover:border-blue-200 transition-colors"
                      >
                        {/* Pattern Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                                {pat.category?.name || 'DSA Pattern'}
                              </span>
                              <DifficultyBadge difficulty={pat.difficulty} size="sm" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 pt-1">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              {pat.title}
                            </h2>
                          </div>

                          {/* Complexities */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-slate-500">Time:</span>
                              <span className="font-bold text-slate-800 font-mono">{pat.timeComplexity || 'O(N)'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-slate-500">Space:</span>
                              <span className="font-bold text-slate-800 font-mono">{pat.spaceComplexity || 'O(1)'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description & Intuition */}
                        <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-600">
                            <Lightbulb className="w-4 h-4" /> Intuition & When to Use
                          </div>
                          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-normal">
                            {pat.description}
                          </div>
                        </div>

                        {/* Key Takeaways */}
                        {pat.keyTakeaways?.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Rules of Thumb
                            </div>
                            <ul className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                              {pat.keyTakeaways.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Multiple Code Examples & Explanations */}
                        {pat.codeExamples?.length > 0 && (
                          <div className="space-y-5 pt-2">
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Code2 className="w-4 h-4 text-blue-600" />
                              Code Implementations & Walkthroughs ({pat.codeExamples.length})
                            </div>

                            <div className="space-y-6">
                              {pat.codeExamples.map((ex, exIdx) => (
                                <div key={ex._id || exIdx} className="rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
                                  {/* Code Header */}
                                  <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                                    <div>
                                      <div className="font-bold text-xs text-white">{ex.title}</div>
                                      {ex.problemDescription && (
                                        <div className="text-[11px] text-slate-400 mt-0.5">{ex.problemDescription}</div>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleCopyCode(ex.code, `${pat._id}-${exIdx}`)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-colors"
                                      title="Copy Code"
                                    >
                                      {copiedCodeId === `${pat._id}-${exIdx}` ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-emerald-400 font-bold">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Code Block */}
                                  <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-400 bg-slate-900/90 leading-relaxed scrollbar-thin">
                                    <code>{ex.code}</code>
                                  </pre>

                                  {/* Step-by-Step Code Explanation */}
                                  <div className="p-4 bg-slate-800/80 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                                    <div className="font-bold text-slate-100 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Step-by-Step Explanation:
                                    </div>
                                    <div className="leading-relaxed whitespace-pre-line text-slate-300">
                                      {ex.explanation}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Footer */}
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              handleCategorySelect(pat.category?.slug || '');
                              handleTabToggle('problems');
                            }}
                            className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700"
                          >
                            Solve related {pat.category?.name || 'DSA'} problems <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Sidebar (30% - lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Featured Pattern Guides */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Featured DSA Patterns
              </h3>
              <button
                onClick={() => handleTabToggle('patterns')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {patterns.slice(0, 3).map((pat) => (
                <div
                  key={pat._id}
                  onClick={() => {
                    handleTabToggle('patterns');
                  }}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      {pat.title}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-600">
                      {pat.codeExamples?.length || 1} ex
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    {pat.description.replace(/[#*`]/g, '')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Your Progress */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Your Progress
              </h3>
              <Link to="/profile" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Progress Gauge + 4 Stats */}
            <div className="flex items-center gap-5 pt-1">
              {/* Radial Circular Progress Gauge */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-slate-900 text-sm">
                  {progressPercent}%
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Solved
                  </div>
                  <div className="font-bold text-sm text-slate-900">{solvedCount}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Total Problems
                  </div>
                  <div className="font-bold text-sm text-slate-900">{totalCount}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                    <Flame className="w-3 h-3 fill-amber-500" /> Day Streak
                  </div>
                  <div className="font-bold text-sm text-slate-900">{user?.dailyStreak || 2}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                    <Trophy className="w-3 h-3" /> Global Rank
                  </div>
                  <div className="font-bold text-sm text-slate-900">Top 35%</div>
                </div>
              </div>
            </div>

            {/* Motivational Quote Box */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-blue-700 text-xs italic font-medium">
              <Quote className="w-4 h-4 shrink-0 text-blue-400" />
              <span>"Consistency today, brighter tomorrow."</span>
            </div>
          </div>

          {/* Card 3: Popular Topics */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Popular Topics
              </h3>
              <button 
                onClick={() => handleCategorySelect('')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Popular Topics List with Progress Bars */}
            <div className="space-y-3.5">
              {categories.slice(0, 4).map((cat, i) => {
                const count = cat.questionStats?.total || (i === 0 ? 51 : i === 1 ? 33 : i === 2 ? 15 : 9);
                const percent = i === 0 ? 28 : i === 1 ? 18 : i === 2 ? 32 : 45;
                const iconBg = i === 0 ? 'bg-blue-50 text-blue-600' : i === 1 ? 'bg-emerald-50 text-emerald-600' : i === 2 ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600';
                
                return (
                  <div 
                    key={cat._id || i}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${iconBg} font-bold text-xs flex items-center justify-center`}>
                        {cat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{cat.name}</div>
                        <div className="text-[11px] text-slate-400">{count} problems</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 w-7 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
