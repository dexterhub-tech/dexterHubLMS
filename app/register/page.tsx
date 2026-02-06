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
import { Loader2, User, Mail, Lock, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('learner');
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
      toast.success('Onboarding Successful. Welcome to DexterHub.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Onboarding failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-20">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 text-white">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[130px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-lg relative z-10 space-y-10">
        {/* Logo/Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            <Sparkles className="w-3 h-3" /> System Onboarding
          </div>
          <h1 className="text-5xl font-semibold tracking-tighter text-white">Join DexterHub</h1>
          <p className="text-slate-400 text-sm font-medium">Create your professional learning identity</p>
        </div>

        {/* Register Card */}
        <Card className="bg-white/[0.03] backdrop-blur-2xl border-white/10 shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-2xl font-semibold text-white">Establish Profile</CardTitle>
            <CardDescription className="text-slate-400 italic">Complete the form below to initialize your workspace account.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/5 border-white/10 h-12 pl-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="bg-white/5 border-white/10 h-12 pl-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 h-12 pl-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Secured Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 h-12 pl-11 text-white placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/50 rounded-2xl transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-1">
                  {password.length >= 6 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Minimum 6 characters required</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Workspace Role
                </label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-2xl text-white focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="learner" className="focus:bg-indigo-600 focus:text-white">Learner (Student)</SelectItem>
                    <SelectItem value="instructor" className="focus:bg-indigo-600 focus:text-white">Instructor (Faculty)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group mt-4 overflow-hidden relative"
              >
                {/* Glowing Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Confirm Registration
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500 font-medium">Already recognized? </span>
              <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
