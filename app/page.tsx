'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Activity, ShieldCheck, Globe, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="space-y-6 text-center">
          <div className="w-12 h-12 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
              Dexter<span className="text-indigo-600">Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl px-4 md:px-6 h-9 md:h-11 uppercase tracking-widest text-[10px]">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-slate-900 hover:bg-black text-white rounded-xl px-4 md:px-8 h-9 md:h-11 font-semibold shadow-lg shadow-slate-200 uppercase tracking-widest text-[10px] transition-all active:scale-95">
                Join
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-32 md:pb-40 text-center">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Activity className="w-3 md:w-3.5 h-3 md:h-3.5" /> LMS Infrastructure
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1] md:leading-[1.05]">
              Elevate your learning <br className="hidden md:block" /> with <span className="text-indigo-600">Cohorts.</span>
            </h1>

            <p className="text-base md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed md:leading-relaxed px-2 md:px-4">
              A modern, cohort-based learning management system designed for high-performance training and transparent progression.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 md:pt-8 px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 h-14 md:h-16 text-base md:text-lg font-semibold shadow-xl shadow-indigo-100 transition-transform active:scale-95">
                  Get Started <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl px-10 h-14 md:h-16 text-base md:text-lg font-semibold border-slate-200 text-slate-600 hover:bg-slate-50">
                Live Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Brand Bar */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 border-y border-slate-50 overflow-hidden">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-20 grayscale">
            <p className="text-lg md:text-2xl font-black italic tracking-tighter">VERSACE</p>
            <p className="text-lg md:text-2xl font-black tracking-widest uppercase">Prada</p>
            <p className="text-lg md:text-2xl font-black tracking-tight">Dior</p>
            <p className="text-lg md:text-2xl font-black italic">ROLEX</p>
            <p className="text-lg md:text-2xl font-black uppercase tracking-tighter">Gucci</p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="group bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] p-8 md:p-10 border-none">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Curated Tracks</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Organize learning into structured modules and lessons with a focus on logical progression.
                </p>
              </div>
            </Card>

            <Card className="group bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] p-8 md:p-10 border-none">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-600 transition-colors">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Collaborative</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Connect with learners worldwide through cohort-based interactions and peer accountability.
                </p>
              </div>
            </Card>

            <Card className="group bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[32px] p-8 md:p-10 border-none">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-600 transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Verified Skills</h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  Validation workflows ensure every certification is backed by genuine human review.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-32">
          <div className="relative overflow-hidden bg-slate-900 rounded-[40px] p-10 md:p-20 text-center space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
              Ready to upscale <br className="hidden md:block" /> your <span className="text-indigo-400">knowledge?</span>
            </h2>
            <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto font-medium">
              Join a specialized cohort today and experience the future of professional education.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-4 px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-10 h-14 md:h-16 text-base font-bold transition-all active:scale-95">
                  Create Account
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-10 h-14 md:h-16 text-base font-bold transition-all active:scale-95">
                  Enter Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-50 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">DexterHub</div>
            </div>

            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Link href="#" className="hover:text-indigo-600">Privacy</Link>
              <Link href="#" className="hover:text-indigo-600">Terms</Link>
              <Link href="#" className="hover:text-indigo-600">Security</Link>
            </div>

            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">© 2026 DEXTERHUB TECHNOLOGY</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
