'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Access Granted. Welcome back.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden px-4">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            <Sparkles className="w-3 h-3" /> Secure Access
          </div>
          <h1 className="text-5xl font-semibold tracking-tighter text-white">DexterHub</h1>
          <p className="text-slate-400 text-sm font-medium">Enterprise Learning Management System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-2xl font-semibold text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access your workspace</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Email Identity
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 h-12 pl-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Secret Key
                  </label>
                  <button type="button" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                    Forgot Key?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 h-12 pl-11 pr-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Initialize Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500 font-medium">New to the platform? </span>
              <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-sm p-4 border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Sandboxed Access</p>
            <div className="flex gap-4 mt-0.5 whitespace-nowrap overflow-auto no-scrollbar">
              <p className="text-[11px] text-slate-500">Email: <span className="font-mono text-slate-300 ml-1">demo@example.com</span></p>
              <p className="text-[11px] text-slate-500">Key: <span className="font-mono text-slate-300 ml-1">demo123456</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
