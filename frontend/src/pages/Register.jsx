import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/practice');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h2 className="text-2xl font-extrabold text-white">Join SonuTechHub</h2>
          <p className="text-xs text-gray-400">
            Start mastering Data Structures & Algorithms in Java today.
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
              <label className="text-gray-300 font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-semibold">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
