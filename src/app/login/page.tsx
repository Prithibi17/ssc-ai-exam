'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  ArrowRight,
  KeyRound,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { usePlatformStore } from '@/lib/store/usePlatformStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = usePlatformStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsNotRegistered(false);
    setIsLoading(true);

    const cleanPhone = phone.trim();
    const cleanPass = password.trim();

    if (!cleanPhone) {
      setErrorMessage('Please enter your 10-digit mobile number or ID.');
      setIsLoading(false);
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup') {
      const cleanName = fullName.trim();
      if (!cleanName) {
        setErrorMessage('Please enter your full name.');
        setIsLoading(false);
        return;
      }

      if (cleanPass.length < 4) {
        setErrorMessage('Password must be at least 4 characters long.');
        setIsLoading(false);
        return;
      }

      if (cleanPass !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        setIsLoading(false);
        return;
      }

      const res = await signup(cleanPhone, cleanName, cleanPass);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed. Please try again.');
        return;
      }

      setSuccessMessage('Account created successfully! Loading portal...');
      setTimeout(() => {
        if (res.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 700);
    } else {
      const res = await login(cleanPhone, cleanPass);
      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Invalid mobile number or password.');
        if (res.notRegistered) {
          setIsNotRegistered(true);
        }
        return;
      }

      if (res.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const switchToSignup = () => {
    setMode('signup');
    setErrorMessage('');
    setIsNotRegistered(false);
  };

  const switchToSignin = () => {
    setMode('signin');
    setErrorMessage('');
    setIsNotRegistered(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-[#F5F8FC]">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-8 shadow-card space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A] text-white font-black text-sm shadow-md">
            SSC
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#111B32] tracking-tight">
            PARIKSHA<span className="text-[#155DFC]">AI</span> PORTAL
          </h1>
          <p className="text-[11px] sm:text-xs text-[#64748B]">
            Official CBT Mock Assessment & AI Learning System
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-bold">
          <button
            type="button"
            onClick={switchToSignin}
            className={`py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-white text-[#111B32] shadow-xs'
                : 'text-[#64748B] hover:text-[#111B32]'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Candidate Sign In</span>
          </button>
          <button
            type="button"
            onClick={switchToSignup}
            className={`py-2 sm:py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-[#111B32] shadow-xs'
                : 'text-[#64748B] hover:text-[#111B32]'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-3 text-xs text-[#059669] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl bg-[#FFF1F2] border border-[#FECDD3] p-3 text-xs text-[#E11D48] space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            {isNotRegistered && (
              <button
                type="button"
                onClick={switchToSignup}
                className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-[#E11D48] text-white text-[11px] font-bold hover:bg-[#BE123C] transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Your Account Now →</span>
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-[#111B32] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arun Sharma"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2.5 text-[#111B32] text-xs placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#111B32] mb-1">
              {mode === 'signup' ? 'Mobile Number (10 digits)' : 'Mobile Number / User ID'}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                required
                autoComplete="off"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={mode === 'signup' ? 'e.g. 9876543210' : 'Enter registered mobile number'}
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2.5 text-[#111B32] text-xs font-mono placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#111B32] mb-1">
              {mode === 'signup' ? 'Set Password' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-10 py-2.5 text-[#111B32] text-xs placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111B32]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-[#111B32] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="off"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2.5 text-[#111B32] text-xs placeholder-[#94A3B8] focus:border-[#155DFC] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#155DFC] hover:bg-[#124BD4] py-3 font-bold text-white text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <span>
              {isLoading
                ? 'Processing...'
                : mode === 'signup'
                ? 'Create Account & Start'
                : 'Sign In to Portal'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer info note */}
        <div className="pt-3 border-t border-[#E2E8F0] text-center">
          <p className="text-[11px] text-[#64748B]">
            {mode === 'signin' ? (
              <>
                New candidate?{' '}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="text-[#155DFC] font-bold hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={switchToSignin}
                  className="text-[#155DFC] font-bold hover:underline"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-[#94A3B8]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Secure Cloud Verification • All test streaks synced in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
