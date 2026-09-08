import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { questionAPI, executeAPI, submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DifficultyBadge from '../components/DifficultyBadge';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  FileText, 
  History, 
  Code2, 
  ChevronLeft,
  Sparkles,
  Copy,
  Check,
  Lock,
  Save,
  LogIn,
  Maximize2,
  Minimize2,
  Flame,
  Settings2
} from 'lucide-react';
import SEO from '../components/SEO';

export default function ProblemWorkspace() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [consoleTab, setConsoleTab] = useState('testcases');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasSavedCode, setHasSavedCode] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const workspaceRef = useRef(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const res = await questionAPI.getByIdOrSlug(idOrSlug);
        if (res.data.success) {
          const q = res.data.question;
          setQuestion(q);
          
          // If user previously worked on this question, load their saved code!
          if (q.savedCode) {
            setCode(q.savedCode);
            setHasSavedCode(true);
          } else {
            setCode(q.starterCode || `import java.util.*;\n\nclass Solution {\n    public int solve(int[] nums) {\n        // Write your solution here\n        \n    }\n}`);
            setHasSavedCode(false);
          }
          
          if (q.examples && q.examples.length > 0) {
            setCustomInput(q.examples[0].input || '');
          }
        }
      } catch (err) {
        console.error('Failed to load question:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [idOrSlug, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && question?._id) {
      loadSubmissions();
    }
  }, [isAuthenticated, question?._id]);

  // Global Keyboard Shortcuts (Ctrl+Enter to Run, Ctrl+Shift+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmitCode();
        } else {
          handleRunCode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, question, isAuthenticated]);

  const loadSubmissions = async () => {
    try {
      const res = await submissionAPI.getQuestionSubmissions(question._id);
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  const handleResetToBoilerplate = () => {
    if (question && window.confirm('Reset code to initial clean starter template? Any unsaved changes will be lost.')) {
      setCode(question.starterCode);
      setHasSavedCode(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  const handleRunCode = async () => {
    if (!isAuthenticated) {
      alert('Authentication required: Please log in with your student account to run tests and execute code.');
      navigate('/login');
      return;
    }

    setIsRunning(true);
    setConsoleTab('output');
    try {
      const payload = {
        code,
        questionId: question?._id,
        customInput: consoleTab === 'custom' && customInput ? customInput : undefined
      };
      const res = await executeAPI.run(payload);
      setExecutionResult(res.data);
      setHasSavedCode(true);
    } catch (err) {
      setExecutionResult({
        status: 'Runtime Error',
        passed: false,
        errorDetails: err.response?.data?.message || err.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      alert('Authentication required: Please log in to submit your solution and record your progress!');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setConsoleTab('output');
    try {
      const res = await executeAPI.submit({
        code,
        questionId: question?._id
      });
      setExecutionResult(res.data);
      setHasSavedCode(true);

      if (res.data.status === 'Accepted') {
        triggerConfetti();
        if (refreshUser) refreshUser();
      }
      loadSubmissions();
    } catch (err) {
      setExecutionResult({
        status: 'Runtime Error',
        passed: false,
        errorDetails: err.response?.data?.message || err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#0b0f19]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mx-auto" />
          <p className="text-xs text-gray-400">Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-gray-900 border border-gray-800 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Problem Not Found</h2>
        <p className="text-xs text-gray-400 mt-2">The question you requested does not exist or has been removed.</p>
        <Link to="/practice" className="mt-6 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
          Back to Practice Track
        </Link>
      </div>
    );
  }

  return (
    <div ref={workspaceRef} className={`flex flex-col bg-[#0b0f19] ${isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[calc(100vh-4rem)]'}`}>
      <SEO
        title={`${question.title} (${question.difficulty})`}
        description={`Solve ${question.title} in Java on SonuTechHub. Category: ${question.category?.name || 'DSA'}. Test against sample and hidden test cases with OpenJDK 24 compiler.`}
        keywords={`${question.title} Java, ${question.title} solution Java, ${question.tags?.join(', ') || ''}, ${question.category?.name || 'DSA'} Java`}
      />
      
      {/* Auth Warning Bar if not logged in */}
      {!isAuthenticated && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>You are viewing in guest mode. <strong>Sign in is required</strong> to run compiler tests, evaluate test cases, and save progress.</span>
          </div>
          <Link to="/login" className="font-bold underline hover:text-amber-200 flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" /> Sign In Now
          </Link>
        </div>
      )}

      {/* Top Problem Header Bar */}
      <div className="h-12 border-b border-gray-800 bg-[#0f172a] px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            to="/practice"
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Back to Problem List"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="font-semibold text-white truncate max-w-md text-sm">
            {question.title}
          </span>
          <DifficultyBadge difficulty={question.difficulty} size="sm" />
          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] border border-gray-700">
            {question.category?.name || 'DSA'}
          </span>
          {hasSavedCode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Save className="w-3 h-3" /> Progress Saved
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
            title="Copy Java Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleResetToBoilerplate}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
            title="Reset to clean boilerplate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Boilerplate
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-1 text-[11px]"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Pane: Problem Details & Submissions */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-gray-800 bg-[#0d121f] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center space-x-1 border-b border-gray-800 bg-[#0f172a] px-3 pt-2">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'description'
                  ? 'bg-[#0d121f] text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'bg-[#0d121f] text-emerald-400 border-t-2 border-emerald-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Submissions ({submissions.length})
            </button>
            {question.hints && question.hints.length > 0 && (
              <button
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'hints'
                    ? 'bg-[#0d121f] text-emerald-400 border-t-2 border-emerald-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Hints
              </button>
            )}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-gray-200">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{question.title}</h2>
                  <div className="flex items-center gap-2">
                    <DifficultyBadge difficulty={question.difficulty} />
                    <span className="text-xs text-gray-400">Topic: {question.category?.name}</span>
                  </div>
                </div>

                {/* Problem statement */}
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                  {question.description}
                </div>

                {/* Input / Output Format */}
                {(question.inputFormat || question.outputFormat) && (
                  <div className="space-y-3 pt-3 border-t border-gray-800">
                    {question.inputFormat && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Input Format:</h4>
                        <div className="p-2.5 rounded-lg bg-gray-900 font-mono text-xs text-gray-300 whitespace-pre-line border border-gray-800">
                          {question.inputFormat}
                        </div>
                      </div>
                    )}
                    {question.outputFormat && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Output Format:</h4>
                        <div className="p-2.5 rounded-lg bg-gray-900 font-mono text-xs text-gray-300 whitespace-pre-line border border-gray-800">
                          {question.outputFormat}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Examples */}
                {question.examples && question.examples.length > 0 && (
                  <div className="space-y-4 pt-3 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Examples:</h4>
                    {question.examples.map((ex, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
                        <div className="text-xs font-semibold text-emerald-400">Example {i + 1}</div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-mono">Input:</div>
                          <pre className="p-2 rounded bg-black/40 text-xs text-gray-200 font-mono overflow-x-auto">
                            {ex.input}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-mono">Output:</div>
                          <pre className="p-2 rounded bg-black/40 text-xs text-emerald-300 font-mono overflow-x-auto">
                            {ex.output}
                          </pre>
                        </div>
                        {ex.explanation && (
                          <div className="text-xs text-gray-400 pt-1">
                            <strong className="text-gray-300">Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {question.constraints && (
                  <div className="space-y-2 pt-3 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Constraints:</h4>
                    <pre className="p-3 rounded-lg bg-gray-900 text-xs text-gray-300 font-mono whitespace-pre-line border border-gray-800">
                      {question.constraints}
                    </pre>
                  </div>
                )}

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-400">Tags:</span>
                    {question.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Your Submission History</h3>
                {submissions.length === 0 ? (
                  <p className="text-xs text-gray-400">No submissions yet for this problem. Submit your solution to record progress.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div
                        key={sub._id}
                        className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sub.status === 'Accepted' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span className={`font-semibold ${sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-gray-400">
                            {sub.passedTestCases}/{sub.totalTestCases} Passed • {sub.executionTimeMs} ms
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(sub.createdAt).toLocaleString()}
                        </div>
                        {/* Quick restore code button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Load this submitted code into your editor?')) {
                              setCode(sub.code);
                            }
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                        >
                          Load this code in editor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" /> Hints & Approach
                </h3>
                {question.hints.map((hint, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                    <strong>Hint {idx + 1}:</strong> {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Clean Monaco Editor (No intrusive auto-correct) & Console */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[#111827] overflow-hidden">
          {/* Editor Header */}
          <div className="h-10 bg-[#0f172a] border-b border-gray-800 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Java (OpenJDK 24)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                {code.includes('class Solution') ? 'Solution.java' : 'Main.java'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Settings2 className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-[11px] rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  title="Editor Font Size"
                >
                  <option value={12}>12px</option>
                  <option value={13}>13px</option>
                  <option value={14}>14px</option>
                  <option value={15}>15px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>
              </div>
              <span className="hidden xl:inline-flex items-center text-[10px] text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                ⚡ Ctrl+Enter: Run | Ctrl+Shift+Enter: Submit
              </span>
            </div>
          </div>

          {/* Monaco Editor (Configured without auto-correct / intrusive word suggestions) */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              language="java"
              theme="vs-dark"
              value={code}
              onChange={(value) => {
                setCode(value || '');
                setHasSavedCode(false);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                fontFamily: 'Fira Code, JetBrains Mono, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                formatOnPaste: false,
                quickSuggestions: false, // Disables intrusive auto-complete popups
                suggestOnTriggerCharacters: false,
                wordBasedSuggestions: false, // Disables auto-completing previous words
                snippetSuggestions: 'none',
                tabCompletion: 'off',
                acceptSuggestionOnEnter: 'off'
              }}
            />
          </div>

          {/* Test Runner & Output Console */}
          <div className="h-64 border-t border-gray-800 bg-[#0a0e17] flex flex-col shrink-0">
            {/* Console Tabs */}
            <div className="h-9 bg-[#0d121f] border-b border-gray-800 px-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setConsoleTab('testcases')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    consoleTab === 'testcases' ? 'bg-gray-800 text-emerald-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Sample Cases
                </button>
                <button
                  onClick={() => setConsoleTab('custom')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    consoleTab === 'custom' ? 'bg-gray-800 text-emerald-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Custom Input
                </button>
                <button
                  onClick={() => setConsoleTab('output')}
                  className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    consoleTab === 'output' ? 'bg-gray-800 text-emerald-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Terminal className="w-3 h-3" /> Console Verdict
                  {executionResult && (
                    <span className={`w-2 h-2 rounded-full ${executionResult.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  )}
                </button>
              </div>

              <div className="text-[10px] text-gray-500">
                {executionResult?.executionTimeMs ? `${executionResult.executionTimeMs} ms` : ''}
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {consoleTab === 'testcases' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(question.testCases || []).map((tc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedTestCaseIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                          selectedTestCaseIdx === idx
                            ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {question.testCases && question.testCases[selectedTestCaseIdx] && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] text-gray-400">Input:</span>
                        <pre className="p-2 rounded bg-black/60 text-gray-200 mt-1 overflow-x-auto">
                          {question.testCases[selectedTestCaseIdx].input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400">Expected Output:</span>
                        <pre className="p-2 rounded bg-black/60 text-emerald-300 mt-1 overflow-x-auto">
                          {question.testCases[selectedTestCaseIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {consoleTab === 'custom' && (
                <div className="space-y-2 h-full flex flex-col">
                  <span className="text-[11px] text-gray-400">Standard Input (stdin):</span>
                  <textarea
                    rows={4}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Type custom inputs line by line..."
                    className="w-full flex-1 p-2 rounded-lg bg-black/60 text-gray-200 border border-gray-800 text-xs font-mono focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              )}

              {consoleTab === 'output' && (
                <div>
                  {!executionResult ? (
                    <div className="text-gray-500 text-center py-6">
                      Click "Run Code" to compile & test against sample cases, or "Submit" for full evaluation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        executionResult.status === 'Accepted'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : executionResult.status === 'Compilation Error'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          {executionResult.status === 'Accepted' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <div>
                            <div className="font-bold text-sm">{executionResult.status}</div>
                            {executionResult.totalCases > 0 && (
                              <div className="text-[11px] opacity-80">
                                {executionResult.passedCases} / {executionResult.totalCases} test cases passed
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-[11px]">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {executionResult.executionTimeMs} ms
                          </span>
                        </div>
                      </div>

                      {executionResult.errorDetails && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-rose-400 font-semibold">Compiler / Error Log:</span>
                          <pre className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs overflow-x-auto whitespace-pre-wrap">
                            {executionResult.errorDetails}
                          </pre>
                        </div>
                      )}

                      {executionResult.isCustom && (
                        <div className="space-y-1">
                          <span className="text-[11px] text-gray-400">Program Output:</span>
                          <pre className="p-3 rounded-lg bg-black/60 text-gray-200 text-xs overflow-x-auto whitespace-pre-wrap">
                            {executionResult.output || '(No stdout)'}
                          </pre>
                        </div>
                      )}

                      {executionResult.testResults && executionResult.testResults.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                            Evaluation Breakdown:
                          </span>
                          <div className="space-y-2">
                            {executionResult.testResults.map((tr) => (
                              <div
                                key={tr.caseIndex}
                                className={`p-2.5 rounded-lg border text-xs font-mono ${
                                  tr.passed
                                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                    : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold">
                                    Test Case #{tr.caseIndex} {tr.isHidden ? '(Hidden)' : ''}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    tr.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                  }`}>
                                    {tr.passed ? 'Passed' : tr.status}
                                  </span>
                                </div>

                                {!tr.isHidden && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-800 text-[11px]">
                                    <div>
                                      <span className="text-gray-400">Expected:</span>
                                      <pre className="p-1.5 rounded bg-black/50 text-emerald-300 overflow-x-auto">{tr.expectedOutput}</pre>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Actual:</span>
                                      <pre className="p-1.5 rounded bg-black/50 text-gray-200 overflow-x-auto">{tr.actualOutput || '(empty)'}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="h-12 bg-[#0f172a] border-t border-gray-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                {!isAuthenticated ? (
                  <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Sign in to test
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">Auto-saves code on run/submit</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 disabled:opacity-50 transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${isRunning ? 'animate-spin' : 'fill-emerald-400'}`} />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-105"
                >
                  <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                  {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
