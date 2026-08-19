import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../translations';
import { INITIAL_USER, PAKISTANI_CITIES } from '../data/mockData';

interface AuthModalProps {
  currentLanguage: Language;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isGatekeeper?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentLanguage,
  onClose,
  onLoginSuccess,
  isGatekeeper = false,
}) => {
  const t = translations[currentLanguage];

  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');
  
  // Sign in / Sign up form fields
  const [identifier, setIdentifier] = useState<string>(''); // Email or Phone
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [city, setCity] = useState<string>('Lahore');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Forgot password states
  const [forgotIdentifier, setForgotIdentifier] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [sentOtpCode, setSentOtpCode] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string>('');

  // Handle Login & Signup Submit
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or phone number.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'SIGNUP') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
    }

    const isEmail = identifier.includes('@');
    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: `user_${Date.now()}`,
      name: authMode === 'SIGNUP' ? fullName.trim() : (isEmail ? identifier.split('@')[0] : `Rider ${identifier.slice(-4)}`),
      email: isEmail ? identifier.trim() : '',
      phone: !isEmail ? identifier.trim() : '',
      city: authMode === 'SIGNUP' ? city : 'Pakistan',
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    onLoginSuccess(newUser);
    if (onClose) onClose();
  };

  // Google Sign In
  const handleGoogleSignIn = () => {
    const googleUser: UserProfile = {
      ...INITIAL_USER,
      id: `user_google_${Date.now()}`,
      name: 'Muheer Riaz',
      email: 'muheerariaz@gmail.com',
      city: 'Lahore, Pakistan',
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    onLoginSuccess(googleUser);
    if (onClose) onClose();
  };

  // Send OTP for Forgot Password
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your registered email address or phone number.');
      return;
    }

    // Generate simulated 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpCode(generatedOtp);
    setOtpSent(true);
    setResetSuccessMsg(`Verification code sent to ${forgotIdentifier}. Your OTP is: ${generatedOtp}`);
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredOtp.trim() !== sentOtpCode) {
      setErrorMsg('Invalid verification code (OTP). Please check and enter the 6-digit code correctly.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your new password.');
      return;
    }

    const isEmail = forgotIdentifier.includes('@');
    const userWithResetPass: UserProfile = {
      ...INITIAL_USER,
      id: `user_${Date.now()}`,
      name: isEmail ? forgotIdentifier.split('@')[0] : `Rider ${forgotIdentifier.slice(-4)}`,
      email: isEmail ? forgotIdentifier.trim() : '',
      phone: !isEmail ? forgotIdentifier.trim() : '',
      city: 'Pakistan',
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    onLoginSuccess(userWithResetPass);
    if (onClose) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto ${
        isGatekeeper ? 'min-h-screen' : ''
      }`}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                {authMode === 'SIGNUP'
                  ? 'Create Rider Account'
                  : authMode === 'FORGOT_PASSWORD'
                  ? 'Reset Password'
                  : 'Welcome to EV Tracker'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {authMode === 'SIGNUP'
                  ? 'Register your electric bike & start telemetry'
                  : authMode === 'FORGOT_PASSWORD'
                  ? 'Verify with OTP and create new password'
                  : 'Sign in to access your garage & diagnostics'}
              </p>
            </div>
          </div>

          {!isGatekeeper && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1.5 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banner */}
        {resetSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {/* VIEW 1 & 2: LOGIN & SIGN UP */}
        {authMode !== 'FORGOT_PASSWORD' && (
          <div className="space-y-4">
            {/* Google Fast Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              id="google-signin-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className="h-px bg-slate-800 flex-1" />
              <span>or with Email / Phone</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'SIGNUP' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Email Address or Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. rider@gmail.com or 03001234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  {authMode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setResetSuccessMsg('');
                        setForgotIdentifier(identifier);
                        setAuthMode('FORGOT_PASSWORD');
                      }}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {authMode === 'SIGNUP' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    City in Pakistan <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-1.5"
              >
                <span>{authMode === 'SIGNUP' ? 'Create Account & Start' : 'Sign In to EV Tracker'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch between Login and Signup */}
            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setResetSuccessMsg('');
                  setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
              >
                {authMode === 'LOGIN' ? (
                  <span>
                    Don't have an account? <strong className="text-emerald-400">Sign Up</strong>
                  </span>
                ) : (
                  <span>
                    Already have an account? <strong className="text-emerald-400">Sign In</strong>
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD FLOW (OTP & New Password) */}
        {authMode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Enter Registered Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. rider@gmail.com or 03001234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    We will send a 6-digit verification code (OTP) to verify your identity.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Send Verification Code (OTP)</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Enter 6-Digit OTP Code
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Code: {sentOtpCode}
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="e.g. 482910"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reset Password & Sign In</span>
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setResetSuccessMsg('');
                  setOtpSent(false);
                  setAuthMode('LOGIN');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
