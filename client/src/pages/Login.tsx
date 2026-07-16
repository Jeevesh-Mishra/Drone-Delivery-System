import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Eye, EyeOff, Lock, Mail, User, Shield, Zap, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: { name: string; email: string; role: string }) => void;
}

// Animated drone particle background
const DroneParticles = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    {/* Flight path lines */}
    <path d="M0 450 Q360 200 720 400 Q1080 600 1440 300" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="2" />
    <path d="M0 600 Q400 300 800 500 Q1200 700 1440 450" fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="1.5" />
    <path d="M200 0 Q500 250 700 150 Q900 50 1200 300" fill="none" stroke="rgba(59,130,246,0.07)" strokeWidth="1.5" />
    {/* Floating drone dots */}
    {[
      {cx:120, cy:200, r:3, op:0.15},
      {cx:400, cy:100, r:2, op:0.12},
      {cx:800, cy:350, r:4, op:0.10},
      {cx:1100, cy:180, r:3, op:0.13},
      {cx:1300, cy:500, r:2, op:0.10},
      {cx:600, cy:700, r:3, op:0.08},
      {cx:200, cy:750, r:2, op:0.10},
      {cx:950, cy:650, r:3, op:0.09},
    ].map((d, i) => (
      <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={`rgba(99,102,241,${d.op})`} />
    ))}
    {/* Grid pattern */}
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(99,102,241,0.04)" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Logistics Operator');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remember, setRemember] = useState(false);

  // Reset fields on mode switch
  useEffect(() => {
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError(res.data.message || 'Authentication failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        // Auto-login after registration
        onLoginSuccess(res.data.token, res.data.user);
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200/80 bg-white/70 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition backdrop-blur-sm";

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      <DroneParticles />

      {/* LEFT PANEL — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative p-12 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Drone Delivery</p>
            <p className="text-indigo-300 text-[10px] leading-tight">Navigation System</p>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live Fleet Active
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Drone Command<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Center
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Manage your entire drone fleet, deliveries, and flight routes from one intelligent dashboard.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            {[
              { label: 'Active Drones', value: '8+' },
              { label: 'Routes Optimized', value: '100+' },
              { label: 'Deliveries', value: '500+' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animated drone illustration */}
        <div className="relative h-40">
          <svg viewBox="0 0 340 120" className="w-full h-full opacity-30">
            <path d="M20 80 Q100 30 180 60 Q260 90 320 40" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="6,4" />
            <circle cx="180" cy="60" r="8" fill="#6366f1" opacity="0.8" />
            <line x1="160" y1="57" x2="148" y2="50" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="200" y1="57" x2="212" y2="50" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="160" y1="63" x2="148" y2="70" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="200" y1="63" x2="212" y2="70" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="148" cy="50" rx="6" ry="2" fill="#6366f1" opacity="0.5" />
            <ellipse cx="212" cy="50" rx="6" ry="2" fill="#6366f1" opacity="0.5" />
            <ellipse cx="148" cy="70" rx="6" ry="2" fill="#6366f1" opacity="0.5" />
            <ellipse cx="212" cy="70" rx="6" ry="2" fill="#6366f1" opacity="0.5" />
          </svg>
          <p className="absolute bottom-0 left-0 text-[10px] text-gray-600">
            © 2026 Drone Delivery Navigation System
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div
          className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {/* Card header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border border-indigo-400/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login'
                ? 'Sign in to access the command center'
                : 'Join the Drone Command Center'}
            </p>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'login' ? '🔑 Sign In' : '✨ Create Account'}
              </button>
            ))}
          </div>

          {/* Error/Success alerts */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-200 transition">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 accent-indigo-500"
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm tracking-wide hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-2">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Create one →
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-11 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-400/60 focus:ring-red-400'
                      : confirmPassword && confirmPassword === password
                      ? 'border-green-400/60 focus:ring-green-400'
                      : ''
                  }`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Role picker */}
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="Logistics Operator">Logistics Operator</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm tracking-wide hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-2">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                  Sign in →
                </button>
              </p>
            </form>
          )}

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-600">
            <Lock className="w-3 h-3" />
            Secure Drone Command Center · End-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
