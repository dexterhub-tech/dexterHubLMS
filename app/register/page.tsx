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
import { Loader2, User, Mail, Lock, ArrowRight, Layers, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      toast.error('Required fields are missing');
      return;
    }

    if (password.length < 6) {
      toast.error('Security key must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(firstName, lastName, email, password, role);
      toast.success('Registration complete! Welcome to DexterHub.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Onboarding failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden px-4 py-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-10">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          {/* <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mx-auto mb-6">
            <Layers className="w-7 h-7" />
          </div> */}
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Join DexterHub</h1>
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Create your account</p>
        </div>

        {/* Register Card */}
        <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-2">
          <CardHeader className="md:p-10 p-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">Sign Up</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Complete the form below to set up your workspace account.</CardDescription>
          </CardHeader>
          <CardContent className="md:p-10 p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-50 border-slate-100 h-12 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-50 border-slate-100 h-12 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-100 h-12 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
                <div className="flex items-center gap-2 mt-2 ml-1">
                  {password.length >= 6 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />
                  )}
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Min. 6 Characters</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => !isLoading && setRole('learner')}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 group",
                      role === 'learner'
                        ? "bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-100/50"
                        : "bg-slate-50 border-slate-100 hover:border-indigo-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      role === 'learner' ? "bg-indigo-600 text-white" : "bg-white text-slate-400 group-hover:text-indigo-600"
                    )}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-widest", role === 'learner' ? "text-indigo-900" : "text-slate-400")}>Learner</p>
                      <p className="text-[10px] text-slate-400 font-medium">Access as Student</p>
                    </div>
                  </div>

                  <div
                    onClick={() => !isLoading && setRole('instructor')}
                    className={cn(
                      "cursor-pointer p-4 rounded-2xl border-2 transition-all space-y-2 group",
                      role === 'instructor'
                        ? "bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-100/50"
                        : "bg-slate-50 border-slate-100 hover:border-indigo-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      role === 'instructor' ? "bg-indigo-600 text-white" : "bg-white text-slate-400 group-hover:text-indigo-600"
                    )}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-widest", role === 'instructor' ? "text-indigo-900" : "text-slate-400")}>Instructor</p>
                      <p className="text-[10px] text-slate-400 font-medium">Access as Faculty</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 group mt-4 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500 font-medium">Already registered? </span>
              <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
