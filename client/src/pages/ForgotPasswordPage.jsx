import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function ForgotPasswordPage({ onNavigateLogin }) {
  const { requestOtp, resetPassword, loading } = useAuth();

  const [step, setStep] = useState(1); // 1: Enter ID/Email, 2: Enter OTP, 3: Set Password, 4: Success
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError('Please provide your Employee ID or Registered Email.');
      return;
    }

    try {
      const data = await requestOtp(identifier.trim());
      setMaskedEmail(data.email || 'registered email');
      setDemoOtp(data.demoOtp || '');
      setOtp(data.demoOtp || ''); // pre-fill for ease of testing
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to find account.');
    }
  };

  // Step 2: Proceed to password after OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setStep(3);
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await resetPassword(identifier.trim(), otp.trim(), newPassword);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-100/50 via-red-50/20 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3 shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Password Recovery</h2>
          <p className="text-xs text-slate-500 mt-1">
            Honda Grievance Redressal Secure Authentication Portal
          </p>
        </div>

        <div className="bg-white border border-slate-200 backdrop-blur-xl py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          
          {/* Step Stepper Indicator */}
          <div className="flex items-center justify-between mb-6 px-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {s === 4 ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 transition-all ${
                      step > s ? 'bg-red-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter Employee ID or Official Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HND-1F-201 or rohan.kulkarni@honda.co.in"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  A 6-digit security code will be generated for your verified Honda profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Verifying Account...' : 'Send Verification Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">Verification Code Sent</p>
                <p className="text-[11px] text-slate-600">
                  A 6-digit security OTP was sent to your registered channel: <strong className="text-red-600">{maskedEmail}</strong>
                </p>
                {demoOtp && (
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-amber-600 font-semibold">Demo Quick-Fill OTP:</span>
                    <span className="font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded font-bold tracking-widest shadow-xs">
                      {demoOtp}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Verify Code
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Updating Credentials...' : 'Save New Password'}
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success State */}
          {step === 4 && (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Password Updated Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your Honda Associate credentials have been safely renewed. You can now sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30"
              >
                Return to Login Page
              </button>
            </div>
          )}

          {/* Back to login footer */}
          {step !== 4 && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
