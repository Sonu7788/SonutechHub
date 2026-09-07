import React, { useState, useEffect, useRef } from 'react';
import { 
  categoryAPI, 
  questionAPI, 
  submissionAPI,
  adminUserAPI
} from '../services/api';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Search, 
  Code2, 
  X,
  Sparkles,
  Users,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  Key,
  Eye,
  Trophy,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'users' | 'bulk-upload' | 'categories' | 'analytics'
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // Modals state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // User Management Modals
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user', isBlocked: false, blockReason: '' });
  const [inspectUser, setInspectUser] = useState(null);
  const [inspectUserData, setInspectUserData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState(null);

  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  // Question Form State
  const [qForm, setQForm] = useState({
    title: '',
    category: '',
    difficulty: 'Easy',
    tags: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    starterCode: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n        \n    }\n}`,
    hints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }]
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    icon: 'Layers',
    color: '#3B82F6',
    order: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [qRes, cRes, aRes, uRes] = await Promise.all([
        questionAPI.getAll({ limit: 500 }),
        categoryAPI.getAll(),
        submissionAPI.getAdminAnalytics(),
        adminUserAPI.getAll({ limit: 500 })
      ]);

      if (qRes.data.success) setQuestions(qRes.data.questions);
      if (cRes.data.success) setCategories(cRes.data.categories);
      if (aRes.data.success) setAnalytics(aRes.data.analytics);
      if (uRes.data.success) setUsers(uRes.data.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // User Management Handlers
  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless changing
      role: user.role || 'user',
      isBlocked: !!user.isBlocked,
      blockReason: user.blockReason || ''
    });
    setShowUserEditModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminUserAPI.update(editingUser._id || editingUser.id, userForm);
      if (res.data.success) {
        setShowUserEditModal(false);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user account');
    }
  };

  const handleToggleBlock = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block from practice';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await adminUserAPI.toggleBlock(user._id || user.id, {
        blockReason: user.isBlocked ? '' : 'Blocked by administrator'
      });
      if (res.data.success) {
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update block state');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and their submissions?')) return;
    try {
      const res = await adminUserAPI.delete(userId);
      if (res.data.success) {
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleInspectUser = async (user) => {
    setInspectUser(user);
    setInspectLoading(true);
    setSelectedSubmissionCode(null);
    try {
      const res = await adminUserAPI.getById(user._id || user.id);
      if (res.data.success) {
        setInspectUserData(res.data);
      }
    } catch (err) {
      alert('Failed to load user details');
    } finally {
      setInspectLoading(false);
    }
  };

  // Question Handlers
  const handleOpenNewQuestion = () => {
    setEditingQuestion(null);
    setQForm({
      title: '',
      category: categories[0]?._id || '',
      difficulty: 'Easy',
      tags: '',
      description: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      starterCode: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n        \n    }\n}`,
      hints: '',
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = async (q) => {
    try {
      const res = await questionAPI.getByIdOrSlug(q._id);
      if (res.data.success) {
        const fullQ = res.data.question;
        setEditingQuestion(fullQ);
        setQForm({
          title: fullQ.title || '',
          category: fullQ.category?._id || fullQ.category || '',
          difficulty: fullQ.difficulty || 'Easy',
          tags: Array.isArray(fullQ.tags) ? fullQ.tags.join(', ') : '',
          description: fullQ.description || '',
          inputFormat: fullQ.inputFormat || '',
          outputFormat: fullQ.outputFormat || '',
          constraints: fullQ.constraints || '',
          starterCode: fullQ.starterCode || '',
          hints: Array.isArray(fullQ.hints) ? fullQ.hints.join('\n') : '',
          examples: fullQ.examples?.length ? fullQ.examples : [{ input: '', output: '', explanation: '' }],
          testCases: fullQ.testCases?.length ? fullQ.testCases : [{ input: '', expectedOutput: '', isHidden: false }]
        });
        setShowQuestionModal(true);
      }
    } catch (err) {
      alert('Failed to fetch question details');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const res = await questionAPI.delete(id);
      if (res.data.success) {
        setQuestions(questions.filter(q => q._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...qForm,
        tags: qForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        hints: qForm.hints.split('\n').map(h => h.trim()).filter(Boolean)
      };

      if (editingQuestion) {
        await questionAPI.update(editingQuestion._id, payload);
      } else {
        await questionAPI.create(payload);
      }
      setShowQuestionModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  // Category Handlers
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatForm({ name: '', description: '', icon: 'Layers', color: '#3B82F6', order: categories.length + 1 });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name || '',
      description: cat.description || '',
      icon: cat.icon || 'Layers',
      color: cat.color || '#3B82F6',
      order: cat.order || 0
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? All associated questions will be deleted too!')) return;
    try {
      const res = await categoryAPI.delete(id);
      if (res.data.success) {
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete category failed');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, catForm);
      } else {
        await categoryAPI.create(catForm);
      }
      setShowCategoryModal(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  // Bulk Upload Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleBulkUploadSubmit = async () => {
    if (!uploadFile) {
      alert('Please select an Excel (.xlsx) or CSV (.csv) file');
      return;
    }

    setUploadLoading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await questionAPI.bulkUpload(formData);
      setUploadResult({
        success: true,
        message: res.data.message,
        count: res.data.count,
        errors: res.data.errors
      });
      loadAllData();
    } catch (err) {
      setUploadResult({
        success: false,
        message: err.response?.data?.message || 'Bulk upload failed',
        errors: err.response?.data?.errors
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await questionAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'java_dsa_questions_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !filterCat || (q.category?._id === filterCat || q.category === filterCat);
    return matchesSearch && matchesCat;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus = userStatusFilter === 'all' || (userStatusFilter === 'blocked' ? u.isBlocked : !u.isBlocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-6 h-6" />
            </span>
            Admin Control Center
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage users, block/unblock students, edit account credentials, review code progress, and bulk import DSA questions.
          </p>
        </div>

        {analytics && (
          <div className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 p-3 rounded-2xl">
            <div className="text-center px-2">
              <div className="text-lg font-bold text-emerald-400 font-mono">{analytics.totalUsers}</div>
              <div className="text-[10px] text-gray-400 uppercase">Users</div>
            </div>
            <div className="h-6 w-px bg-gray-800" />
            <div className="text-center px-2">
              <div className="text-lg font-bold text-blue-400 font-mono">{analytics.totalQuestions}</div>
              <div className="text-[10px] text-gray-400 uppercase">Questions</div>
            </div>
            <div className="h-6 w-px bg-gray-800" />
            <div className="text-center px-2">
              <div className="text-lg font-bold text-purple-400 font-mono">{analytics.totalSubmissions}</div>
              <div className="text-[10px] text-gray-400 uppercase">Submissions</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'questions'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Code2 className="w-4 h-4" /> Manage Questions ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4 text-cyan-400" /> User & Student Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('bulk-upload')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'bulk-upload'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Excel Bulk Import
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Submissions Stream
        </button>
      </div>

      {/* TAB 1: QUESTIONS MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleOpenNewQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Create New Question
              </button>

              <button
                onClick={() => setActiveTab('bulk-upload')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Bulk Import File
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-900/70 border border-gray-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] text-gray-400 uppercase bg-gray-950/60 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredQuestions.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        {q.title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700">
                          {q.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <DifficultyBadge difficulty={q.difficulty} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(q.tags || []).slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors inline-flex items-center"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors inline-flex items-center"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER & STUDENT MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Filter Status:</span>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Accounts ({users.length})</option>
                <option value="active">Active Accounts</option>
                <option value="blocked">Blocked / Suspended</option>
              </select>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-gray-900/70 border border-gray-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] text-gray-400 uppercase bg-gray-950/60 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Solved Problems</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-emerald-400 border border-gray-700">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-emerald-400 font-semibold text-xs flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> {u.solvedQuestions?.length || 0} Solved
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {/* Inspect Progress */}
                        <button
                          onClick={() => handleInspectUser(u)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors inline-flex items-center"
                          title="View Progress & Submitted Code"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Email / Password */}
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors inline-flex items-center"
                          title="Change Name, Email or Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        {/* Block / Unblock */}
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`p-1.5 rounded-lg transition-colors inline-flex items-center ${
                            u.isBlocked 
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' 
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                          }`}
                          title={u.isBlocked ? 'Unblock User' : 'Block User from Practice'}
                        >
                          {u.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors inline-flex items-center"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXCEL BULK UPLOAD */}
      {activeTab === 'bulk-upload' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  Bulk Upload Questions via Excel / CSV
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Upload an Excel workbook (<code className="text-emerald-400">.xlsx</code>, <code className="text-emerald-400">.xls</code>) or CSV (<code className="text-emerald-400">.csv</code>) to automatically insert multiple DSA problems with clean boilerplates and evaluation test cases.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center cursor-pointer bg-gray-950/40 hover:bg-gray-900/40 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-bounce" />
                {uploadFile ? (
                  <div>
                    <div className="font-semibold text-white text-sm">{uploadFile.name}</div>
                    <div className="text-xs text-emerald-400 mt-1">
                      {(uploadFile.size / 1024).toFixed(1)} KB — Ready to upload
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-white text-sm">Click to browse or drag & drop file</div>
                    <div className="text-xs text-gray-500 mt-1">Supports .xlsx, .xls, and .csv files up to 10MB</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  Download Sample Template (.xlsx)
                </button>

                <button
                  onClick={handleBulkUploadSubmit}
                  disabled={!uploadFile || uploadLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  {uploadLoading ? 'Uploading & Parsing...' : 'Import Questions Now'}
                </button>
              </div>

              {uploadResult && (
                <div className={`p-4 rounded-2xl border ${
                  uploadResult.success ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300' : 'bg-rose-950/30 border-rose-800 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {uploadResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
                    {uploadResult.message}
                  </div>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="font-semibold text-gray-300">File Warnings / Line Logs:</div>
                      {uploadResult.errors.map((err, i) => (
                        <div key={i} className="text-amber-400 font-mono">• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-gray-900/60 border border-gray-800 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Template Specifications
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Upload your questions using the pre-formatted structure:
              </p>
              <ul className="space-y-2 text-gray-300 font-mono text-[11px]">
                <li className="p-2 rounded bg-black/40 border border-gray-800">
                  <strong className="text-emerald-400">Title</strong>: Problem Name
                </li>
                <li className="p-2 rounded bg-black/40 border border-gray-800">
                  <strong className="text-emerald-400">Category</strong>: Topic (e.g. Arrays, Trees)
                </li>
                <li className="p-2 rounded bg-black/40 border border-gray-800">
                  <strong className="text-emerald-400">Difficulty</strong>: Easy | Medium | Hard
                </li>
                <li className="p-2 rounded bg-black/40 border border-gray-800">
                  <strong className="text-emerald-400">Description</strong>: Statement & logic
                </li>
                <li className="p-2 rounded bg-black/40 border border-gray-800">
                  <strong className="text-emerald-400">Test Cases 1..N</strong>: Inputs, Expected Outputs, IsHidden
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">DSA Practice Tracks</h2>
            <button
              onClick={handleOpenNewCategory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat._id} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-gray-800 text-emerald-400 border border-gray-700">
                      Order: {cat.order}
                    </span>
                    <div className="space-x-1">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description || 'No description provided'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
                  <span>Slug: <code className="text-gray-300 font-mono">{cat.slug}</code></span>
                  <span className="text-emerald-400 font-semibold">{cat.questionStats?.total || 0} Problems</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUBMISSIONS ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400">Total Users</div>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">{analytics.totalUsers}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400">Total Questions</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{analytics.totalQuestions}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400">Total Submissions</div>
              <div className="text-3xl font-extrabold text-blue-400 mt-2 font-mono">{analytics.totalSubmissions}</div>
            </div>
            <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400">Acceptance Rate</div>
              <div className="text-3xl font-extrabold text-purple-400 mt-2 font-mono">{analytics.acceptanceRate}%</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800">
            <h3 className="text-base font-bold text-white mb-4">Live Submissions Stream</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-gray-400 uppercase bg-gray-950/60 border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {analytics.recentSubmissions?.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-white font-medium">{s.user?.name || 'Anonymous'}</td>
                      <td className="py-3 px-4 text-gray-300">{s.question?.title || 'Unknown Problem'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          s.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400">{s.executionTimeMs} ms</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT (NAME / EMAIL / PASSWORD / BLOCK) MODAL */}
      {showUserEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#131b2e] border border-gray-700 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                Edit Account Credentials
              </h3>
              <button onClick={() => setShowUserEditModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Student Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Email Address (Login ID)</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Change Password (Leave blank to keep current)</label>
                <input
                  type="text"
                  placeholder="New password (min 6 characters)"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Account Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="user">User / Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Block from Practice</div>
                  <div className="text-[10px] text-gray-400">Suspends user testing & submissions</div>
                </div>
                <input
                  type="checkbox"
                  checked={userForm.isBlocked}
                  onChange={(e) => setUserForm({ ...userForm, isBlocked: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Account Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER INSPECT PROGRESS & SUBMITTED CODE DRAWER / MODAL */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131b2e] border border-gray-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  {inspectUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectUser.name}'s Practice Progress</h3>
                  <p className="text-xs text-gray-400 font-mono">{inspectUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {inspectLoading ? (
                <div className="text-center py-10 text-gray-400">Loading user progress details...</div>
              ) : (
                <>
                  {/* Solved Questions List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      Solved Questions ({inspectUserData?.user?.solvedQuestions?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inspectUserData?.user?.solvedQuestions?.map((q) => (
                        <div key={q._id} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                          <span className="font-semibold text-white truncate mr-2">{q.title}</span>
                          <DifficultyBadge difficulty={q.difficulty} size="sm" />
                        </div>
                      ))}
                      {(!inspectUserData?.user?.solvedQuestions || inspectUserData?.user?.solvedQuestions?.length === 0) && (
                        <p className="text-gray-500 col-span-2">No problems solved yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Submission History & Submitted Java Code Inspector */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      Submitted Java Code History ({inspectUserData?.submissions?.length || 0})
                    </h4>
                    
                    {selectedSubmissionCode && (
                      <div className="p-4 rounded-2xl bg-black/80 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                          <span>Inspect Code: {selectedSubmissionCode.title}</span>
                          <button onClick={() => setSelectedSubmissionCode(null)} className="text-gray-400 hover:text-white">
                            Close Preview
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-gray-950 font-mono text-xs text-gray-200 overflow-x-auto border border-gray-800 whitespace-pre-wrap max-h-72">
                          {selectedSubmissionCode.code}
                        </pre>
                      </div>
                    )}

                    <div className="divide-y divide-gray-800 rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
                      {inspectUserData?.submissions?.map((sub) => (
                        <div key={sub._id} className="p-3 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
                          <div className="flex items-center gap-2">
                            {sub.status === 'Accepted' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-rose-400" />
                            )}
                            <div>
                              <span className="font-semibold text-white">{sub.question?.title || 'Problem'}</span>
                              <div className="text-[10px] text-gray-500">{new Date(sub.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              sub.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {sub.status}
                            </span>
                            <button
                              onClick={() => setSelectedSubmissionCode({ title: sub.question?.title, code: sub.code })}
                              className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[11px] font-semibold"
                            >
                              Inspect Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#131b2e] border border-gray-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingQuestion ? 'Edit DSA Question' : 'Create New Java DSA Question'}
              </h2>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-gray-300 font-semibold">Question Title *</label>
                  <input
                    type="text"
                    required
                    value={qForm.title}
                    onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500"
                    placeholder="e.g. Reverse Linked List"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Category *</label>
                  <select
                    required
                    value={qForm.category}
                    onChange={(e) => setQForm({ ...qForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Difficulty</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={qForm.tags}
                    onChange={(e) => setQForm({ ...qForm, tags: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500"
                    placeholder="Array, Two Pointers, Sliding Window"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={qForm.description}
                  onChange={(e) => setQForm({ ...qForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 font-sans"
                  placeholder="Describe the problem, input specifications, and expectations..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Input Format</label>
                  <textarea
                    rows={2}
                    value={qForm.inputFormat}
                    onChange={(e) => setQForm({ ...qForm, inputFormat: e.target.value })}
                    className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Output Format</label>
                  <textarea
                    rows={2}
                    value={qForm.outputFormat}
                    onChange={(e) => setQForm({ ...qForm, outputFormat: e.target.value })}
                    className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Constraints</label>
                  <textarea
                    rows={2}
                    value={qForm.constraints}
                    onChange={(e) => setQForm({ ...qForm, constraints: e.target.value })}
                    className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Java Clean Starter Code Boilerplate</label>
                <textarea
                  rows={6}
                  value={qForm.starterCode}
                  onChange={(e) => setQForm({ ...qForm, starterCode: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/60 border border-gray-700 text-emerald-400 font-mono text-xs"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">Evaluation Test Cases</label>
                  <button
                    type="button"
                    onClick={() => setQForm({
                      ...qForm,
                      testCases: [...qForm.testCases, { input: '', expectedOutput: '', isHidden: false }]
                    })}
                    className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                  >
                    + Add Test Case
                  </button>
                </div>

                {qForm.testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-800/80 border border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Test Case #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => {
                              const updated = [...qForm.testCases];
                              updated[idx].isHidden = e.target.checked;
                              setQForm({ ...qForm, testCases: updated });
                            }}
                            className="rounded text-emerald-600"
                          />
                          Hidden Case
                        </label>
                        {qForm.testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = qForm.testCases.filter((_, i) => i !== idx);
                              setQForm({ ...qForm, testCases: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <textarea
                        rows={2}
                        placeholder="Input (stdin)"
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...qForm.testCases];
                          updated[idx].input = e.target.value;
                          setQForm({ ...qForm, testCases: updated });
                        }}
                        className="p-2 rounded bg-black/50 text-white font-mono border border-gray-700"
                      />
                      <textarea
                        rows={2}
                        placeholder="Expected Output (stdout)"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const updated = [...qForm.testCases];
                          updated[idx].expectedOutput = e.target.value;
                          setQForm({ ...qForm, testCases: updated });
                        }}
                        className="p-2 rounded bg-black/50 text-emerald-400 font-mono border border-gray-700"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-[#131b2e]">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
                >
                  {editingQuestion ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#131b2e] border border-gray-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Display Order</label>
                  <input
                    type="number"
                    value={catForm.order}
                    onChange={(e) => setCatForm({ ...catForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-semibold">Color</label>
                  <input
                    type="text"
                    value={catForm.color}
                    onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                    className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
