'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { authMockService } from '@/services/authMockService';
import { sendPasswordReset } from '@/services/firebaseAuthService';

export default function LoginPage() {
  const router = useRouter();

  // Form State - Starts completely empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ success?: string; error?: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Input Validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please enter both your email address (or username) and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authMockService.login(trimmedEmail, trimmedPassword, rememberMe);

      if (result.success && result.redirectUrl) {
        setSuccessMessage(`Authenticated as ${result.user?.name}! Opening ${result.user?.role.toUpperCase()} Portal...`);
        setTimeout(() => {
          router.push(result.redirectUrl || '/admin/dashboard');
        }, 400);
      } else {
        setErrorMessage(result.error || 'Invalid email or password. Please check your credentials.');
        setIsLoading(false);
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication. Please try again.');
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('admin@123');
    setErrorMessage('');
  };

  const fillSuperAdminCredentials = () => {
    setEmail('superadmin@gmail.com');
    setPassword('super@123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full flex flex-col lg:flex-row bg-[#F4FAFE] select-none font-sans overflow-y-auto lg:overflow-hidden">
      {/* ========================================================= */}
      {/* LEFT HALF: Executive Enterprise CRM Showcase Panel        */}
      {/* ========================================================= */}
      <div className="hidden lg:flex relative w-full lg:w-[52%] xl:w-[50%] h-full max-h-screen bg-[#0284C7] flex-col justify-between overflow-hidden shadow-2xl z-10">
        {/* 1. TOP BRAND HEADER & CAPTION */}
        <div className="relative z-20 px-8 pt-8 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-md flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 80 80" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58 12 A32 32 0 0 0 18 40" fill="none" stroke="#00AEEF" strokeWidth="6.5" strokeLinecap="round" />
                  <path d="M53 19 A24 24 0 0 0 22 40" fill="none" stroke="#00AEEF" strokeWidth="6" strokeLinecap="round" />
                  <path d="M48 26 A16 16 0 0 0 26 40" fill="none" stroke="#00AEEF" strokeWidth="5" strokeLinecap="round" />
                  <path d="M18 40 A32 32 0 0 0 58 68" fill="none" stroke="#0F172A" strokeWidth="6.5" strokeLinecap="round" />
                  <path d="M22 40 A24 24 0 0 0 53 61" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
                  <path d="M26 40 A16 16 0 0 0 48 54" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                    COOL
                  </span>
                  <span className="text-xs font-bold tracking-widest uppercase text-sky-200">
                    TECHNOLOGIES
                  </span>
                </div>
                <span className="text-[9px] text-sky-200/90 font-medium tracking-widest uppercase mt-0.5">
                  the science of cooling
                </span>
              </div>
            </div>
          </div>

          {/* Headline & Value Proposition (The Caption) */}
          <div className="mt-5 max-w-xl">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Smart CRM for Smarter Business
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-sky-100/90 font-medium leading-relaxed">
              Enterprise command center for Leads, Sales, Commercial HVAC Service Operations &amp; Analytics.
            </p>
          </div>
        </div>

        {/* 2. FULL-BLEED HEADQUARTERS BUILDING PHOTO */}
        <div className="relative flex-1 w-full overflow-hidden flex items-end">
          <img
            src="/login-building.jpg"
            alt="Cool Technologies Headquarters"
            className="w-full h-full object-cover object-bottom"
          />
          {/* Subtle gradient blending sky into top header */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0284C7] to-transparent pointer-events-none" />
        </div>

        {/* 3. BOTTOM ENTERPRISE SECURITY FOOTER */}
        <div className="relative z-20 h-10 bg-[#002B49]/80 backdrop-blur-xs flex items-center justify-between px-8 text-[11px] text-sky-200/90 border-t border-white/10 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
            <span>Role-Based Protected Workspace</span>
          </span>
          <span>Cool Technologies CRM Suite</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF: Elevated Floating Sign-in Card                */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] min-h-screen lg:h-full lg:max-h-screen bg-[#F4FAFE] flex flex-col justify-between items-center px-4 sm:px-8 xl:px-12 py-6 sm:py-8 lg:py-7 overflow-y-auto lg:overflow-hidden">
        {/* Subtle wavy background curves watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100,0 C300,150 450,50 650,200 C750,280 800,450 800,700"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <path
              d="M200,0 C350,250 550,150 700,350 C780,450 800,600 800,700"
              fill="none"
              stroke="#0284C7"
              strokeWidth="1"
            />
          </svg>
        </div>


        {/* FLOATING SIGN-IN CARD */}
        <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-6 sm:p-8 my-auto">
          {/* Card Header & Brand Emblem */}
          <div className="flex flex-col items-center text-center">
            {/* Crisp Vector Swirl Logo */}
            <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center mb-1 shadow-xs border border-slate-100">
              <svg viewBox="0 0 80 80" className="w-11 h-11" xmlns="http://www.w3.org/2000/svg">
                <path d="M58 12 A32 32 0 0 0 18 40" fill="none" stroke="#00AEEF" strokeWidth="6.5" strokeLinecap="round" />
                <path d="M53 19 A24 24 0 0 0 22 40" fill="none" stroke="#00AEEF" strokeWidth="6" strokeLinecap="round" />
                <path d="M48 26 A16 16 0 0 0 26 40" fill="none" stroke="#00AEEF" strokeWidth="5" strokeLinecap="round" />
                <path d="M18 40 A32 32 0 0 0 58 68" fill="none" stroke="#0F172A" strokeWidth="6.5" strokeLinecap="round" />
                <path d="M22 40 A24 24 0 0 0 53 61" fill="none" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
                <path d="M26 40 A16 16 0 0 0 48 54" fill="none" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xl font-black tracking-tight text-[#0F172A]">COOL</span>
              <span className="text-xs font-bold tracking-widest uppercase text-[#00AEEF]">TECHNOLOGIES</span>
            </div>
            <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
              the science of cooling
            </span>

            {/* Heading & Subtitle */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight mt-4">
              Sign In to CRM
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1677FF]/20 focus:border-[#1677FF] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1677FF]/20 focus:border-[#1677FF] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#1677FF] border-slate-300 focus:ring-[#1677FF] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] sm:text-xs">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] sm:text-xs font-semibold text-[#1677FF] hover:text-[#0958D9] hover:underline transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2.5 px-4 bg-[#1677FF] hover:bg-[#0958D9] active:bg-[#003EB3] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In to CRM</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="relative z-10 w-full text-center text-[10px] sm:text-xs text-slate-400 pt-3 pb-1">
          <p>© 2026 Cool Technologies LLC. All rights reserved.</p>
          <p className="text-[10px] text-slate-400/80 mt-0.5">
            The Science of Cooling | Enterprise CRM Suite
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Reset Password & Account Recovery</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your account email to receive a secure Firebase password reset link:
              </p>
            </div>

            {/* Interactive Reset Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setResetFeedback(null);
                if (!resetEmail.trim()) {
                  setResetFeedback({ error: 'Please enter your registered email address.' });
                  return;
                }
                setIsSendingReset(true);
                const res = await sendPasswordReset(resetEmail.trim());
                setIsSendingReset(false);
                if (res.success) {
                  setResetFeedback({ success: res.message });
                } else {
                  setResetFeedback({ error: res.error });
                }
              }}
              className="space-y-2 pt-1"
            >
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
              {resetFeedback?.error && (
                <p className="text-[11px] text-rose-600 font-medium">{resetFeedback.error}</p>
              )}
              {resetFeedback?.success && (
                <p className="text-[11px] text-emerald-600 font-medium">{resetFeedback.success}</p>
              )}
              <button
                type="submit"
                disabled={isSendingReset}
                className="w-full py-2 bg-[#002B49] hover:bg-[#001D33] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSendingReset ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Password Reset Email</span>
                )}
              </button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-400 bg-white px-2">Or Quick Test Login</div>
            </div>

            {/* Admin Credentials */}
            <div className="bg-sky-50/60 p-2.5 rounded-xl text-xs space-y-1 border border-sky-200/80">
              <div className="flex items-center justify-between pb-1 border-b border-sky-100 font-bold text-sky-900 text-[11px]">
                <span>🏢 Admin Role</span>
                <span className="text-[10px] text-sky-600 font-semibold">/admin/dashboard</span>
              </div>
              <p className="flex justify-between text-[11px]">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">admin@gmail.com</span>
              </p>
            </div>

            {/* Super Admin Credentials */}
            <div className="bg-purple-50/60 p-2.5 rounded-xl text-xs space-y-1 border border-purple-200/80">
              <div className="flex items-center justify-between pb-1 border-b border-purple-100 font-bold text-purple-900 text-[11px]">
                <span>👑 Super Admin Role</span>
                <span className="text-[10px] text-purple-600 font-semibold">/dashboard</span>
              </div>
              <p className="flex justify-between text-[11px]">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-800">superadmin@gmail.com</span>
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  fillAdminCredentials();
                  setShowForgotModal(false);
                }}
                className="flex-1 py-1.5 bg-[#1677FF] hover:bg-[#0958D9] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Use Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  fillSuperAdminCredentials();
                  setShowForgotModal(false);
                }}
                className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Use Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetFeedback(null);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
