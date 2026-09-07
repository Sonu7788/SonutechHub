import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogIn, ShieldAlert, User, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/practice');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail('admin@javadsa.com');
    setPassword('admin123');
    setLoading(true);
    setError('');
    try {
      await login('admin@javadsa.com', 'admin123');
      navigate('/admin');
    } catch (err) {
      setError('Admin demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setEmail('student@javadsa.com');
    setPassword('student123');
    setLoading(true);
    setError('');
    try {
      await login('student@javadsa.com', 'student123');
      navigate('/practice');
    } catch (err) {
      setError('Student demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to SonuTechHub</h2>
          <p className="text-xs text-gray-400">
            Access your practice tracks, save submissions, or manage questions.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
            <div className="text-[11px] text-gray-400 font-medium text-center uppercase tracking-wider">
              Quick 1-Click Demo Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Demo Admin
              </button>
              <button
                type="button"
                onClick={handleDemoStudent}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Demo Student
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
