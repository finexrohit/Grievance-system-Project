import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function LoginPage({ onNavigateForgot }) {
  const { login, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!identifier.trim() || !password) {
      setLocalError('Please enter both Employee ID / Email and Password.');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (!res.success) {
      setLocalError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-100/50 via-red-50/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Test Brand Emblem */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 mb-3 border border-red-500/20">
            <span className="font-serif text-4xl font-bold tracking-tighter">T</span>
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-900">
            TEST
          </h1>
          <p className="text-xs uppercase tracking-widest text-red-600 font-bold mt-1">
            Associate Grievance Redressal & Resolution System
          </p>
          <p className="text-xs text-slate-500 mt-2 max-w-sm">
            Unified portal for 5 factory locations (H.O, 1F, 2F, 3F, 4F) & 10 Associate Admins
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 backdrop-blur-xl py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {(localError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employee ID or Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. HND-ADM-HO1 or email@test.co.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgot}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-red-600/30 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Test Corporate & Plant Grievance Redressal Architecture • Internal Use Only
        </p>
      </div>
    </div>
  );
}
