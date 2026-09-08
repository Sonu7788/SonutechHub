import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { categoryAPI, questionAPI } from '../services/api';
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
  ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO';

export default function CategoryPractice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentDifficulty = searchParams.get('difficulty') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(currentSearch);

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

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (!slug) {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
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

  const isSolved = (questionId) => {
    if (!user?.solvedQuestions) return false;
    return user.solvedQuestions.some(q => (typeof q === 'string' ? q : q._id) === questionId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO
        title={currentCategory ? `${categories.find(c => c.slug === currentCategory)?.name || currentCategory} Practice Track` : 'Java DSA Category Practice Track'}
        description={`Practice curated ${currentCategory || 'Data Structures and Algorithms'} questions in Java. Filter by Easy, Medium, Hard with integrated compiler test suites.`}
        keywords={`Java DSA ${currentCategory || ''}, Java Coding Questions, ${currentCategory || 'Arrays, Strings, Trees, Dynamic Programming'}`}
      />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          Java DSA Practice Track
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Pick a category or filter by difficulty to sharpen your problem-solving skills in Java.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            !currentCategory
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
          }`}
        >
          All Topics
        </button>

        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              currentCategory === cat.slug
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
            }`}
          >
            <span>{cat.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-gray-300">
              {cat.questionStats?.total || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
        {/* Difficulty Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Difficulty:
          </span>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => handleDifficultySelect(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentDifficulty === diff
                  ? 'bg-gray-700 text-white font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems, tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </form>
      </div>

      {/* Questions List */}
      <div className="rounded-2xl bg-gray-900/70 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/40">
          <span className="text-xs font-semibold text-gray-400">
            Showing <strong className="text-white">{questions.length}</strong> of <strong className="text-white">{total}</strong> problems
          </span>
          {currentCategory && (
            <span className="text-xs font-medium text-emerald-400">
              Topic: {categories.find(c => c.slug === currentCategory)?.name}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mb-3" />
            <p className="text-xs text-gray-400">Loading Java DSA problems...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No questions found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Try adjusting your category or difficulty filter, or search with different keywords.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] text-gray-400 uppercase bg-gray-950/60 border-b border-gray-800/80">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">Status</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {questions.map((q, idx) => {
                    const solved = isSolved(q._id);
                    return (
                      <tr
                        key={q._id}
                        className="hover:bg-gray-800/30 transition-colors group"
                      >
                        <td className="py-4 px-4 text-center">
                          {solved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto inline" />
                          ) : (
                            <span className="text-xs font-mono text-gray-600">{(currentPage - 1) * pageSize + idx + 1}</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/problem/${q._id}`}
                            className="font-medium text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2"
                          >
                            {q.title}
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700/60">
                            {q.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <DifficultyBadge difficulty={q.difficulty} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(q.tags || []).slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-gray-800/80 text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            to={`/problem/${q._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/10"
                          >
                            Solve <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-800/80 px-4 py-2">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(total / pageSize)}
                totalItems={total}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
