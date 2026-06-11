'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(email);
      toast.success('Reset email has been sent!');
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Password Recovery</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-2">
          <CardHeader className="space-y-1 md:p-8 p-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">Forgot Password?</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              {!isSubmitted 
                ? "Enter your email address and we'll send you a link to reset your password." 
                : "Check your email inbox (and spam folder) for the password reset instructions."}
            </CardDescription>
          </CardHeader>
          <CardContent className="md:p-8 p-4 pt-0">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-slate-50 border-slate-100 h-12 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/10 focus:border-indigo-500/50 rounded-2xl transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95 group mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending link...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Mail className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    An email was sent to <strong className="text-slate-800">{email}</strong> containing a secure password reset link.
                  </p>
                 
                </div>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full h-12 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Resend Email
                </Button>
              </div>
            )}

            {/* Back to Login link */}
            <div className="mt-8 text-center text-sm">
              <Link href="/login" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
