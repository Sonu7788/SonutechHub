import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import SEO from '../components/SEO';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, sendSignupOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  // Handle live 60-second countdown for resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await sendSignupOtp(email, name);
      setSuccessMsg(res.message || `Verification code sent to ${email}`);
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await resendOtp(email, name);
      setSuccessMsg(res.message || `New verification code sent to ${email}`);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.trim().length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, otp.trim());
      navigate('/practice');
    } catch (err) {
      setError(err.message || 'Registration failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Sign Up with Email OTP - SonuTechHub Free Java DSA"
        description="Create your free SonuTechHub account with instant email OTP verification. Start practicing 200+ Java DSA problems today."
      />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Join SonuTech<span className="text-blue-600">Hub</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {step === 1 
              ? 'Start mastering Data Structures & Algorithms in Java today with verified solutions.' 
              : 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {/* Form Container */}
        <div className="clean-card rounded-3xl p-7 sm:p-8 shadow-sm space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${step === 1 ? 'text-blue-600' : 'text-emerald-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {step === 1 ? '1' : '✓'}
              </span>
              Account Details
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 font-bold ${step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </span>
              OTP Verification
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <span className="shrink-0 text-rose-500 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success / Info Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Registration Credentials */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  <>
                    Continue & Send OTP <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Email OTP Input & Verification */}
          {step === 2 && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 space-y-1 text-center">
                <div className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">
                  Verification Code Sent
                </div>
                <div className="font-bold text-sm text-slate-900 truncate">{email}</div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 pt-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Email
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-slate-700 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Enter 6-Digit Code
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Valid for 10 minutes</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-center font-mono font-bold text-xl tracking-[0.5em] placeholder-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-[11px]">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying & Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Create Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
