'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing from the URL');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, password);
      toast.success('Password reset successful!');
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. The token may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-2">
      <CardHeader className="space-y-1 md:p-8 p-4">
        <CardTitle className="text-2xl font-semibold text-slate-900">
          {isSuccess ? 'Password Reset Complete' : 'Reset Your Password'}
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          {isSuccess 
            ? 'Your password has been updated. You will be redirected to the sign-in page shortly.' 
            : 'Enter a secure new password for your account below.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="md:p-8 p-4 pt-0">
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!token && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs font-semibold leading-relaxed">
                ⚠️ Danger: No token detected in URL. Please make sure you clicked the link exactly as sent.
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-100 h-12 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Confirm New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-50 border-slate-100 h-12 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !token}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 group mt-4 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Reset Password
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-700 font-bold text-lg">Your password has been reset!</p>
              <p className="text-sm text-slate-400 font-medium">Redirecting you to the login page now...</p>
            </div>
            <Link href="/login" className="block">
              <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl">
                Go to Sign In Now
              </Button>
            </Link>
          </div>
        )}

        {!isSuccess && (
          <div className="mt-8 text-center text-sm">
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Return to Sign In
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-8 flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 font-medium text-sm">Validating reset details...</p>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden px-4 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Dexter<span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Secure Portal</p>
        </div>

        {/* Reset Password Form Wrapper */}
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
