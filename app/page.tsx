'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Layers, Activity, ShieldCheck, Globe, Sparkles, ChevronRight, Play } from 'lucide-react';
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
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Architecting Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              Dexter<span className="text-indigo-600">Hub</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Principles</Link>
            <Link href="#solutions" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Solutions</Link>
            <Link href="#about" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl px-6 h-11 uppercase tracking-widest text-xs">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 h-11 font-bold shadow-xl shadow-slate-200 uppercase tracking-widest text-xs transition-all active:scale-95">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pt-40 md:pb-48">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Activity className="w-3.5 h-3.5" /> Next Generation LMS Architecture
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-slate-900 leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Mastery through <span className="text-indigo-600">Cohorts.</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed md:leading-relaxed px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              A premium, cohort-based ecosystem designed for high-performance training, accountability, and transparent academic progression.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] px-10 h-16 text-lg font-bold shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95">
                  Begin Journey <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-[24px] px-10 h-16 text-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all hover:border-slate-300">
                <Play className="w-5 h-5 mr-3 fill-slate-400 text-slate-400" /> Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Brand Bar / Social Proof */}
        <section className="max-w-7xl mx-auto px-6 py-12 border-y border-slate-50 overflow-hidden">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <p className="text-2xl font-black italic tracking-tighter">VERSACE</p>
            <p className="text-2xl font-black tracking-widest uppercase">Prada</p>
            <p className="text-2xl font-black tracking-tight">Dior</p>
            <p className="text-2xl font-black italic">ROLEX</p>
            <p className="text-2xl font-black uppercase tracking-tighter">Gucci</p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 md:py-48">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group relative bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[32px] overflow-hidden p-10 md:p-12">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                <Layers className="w-40 h-40 text-indigo-600" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Curated Architecture</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Organize learning into structured modules and lessons with a focus on logical progression and clarity.
                </p>
              </div>
            </Card>

            <Card className="group relative bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[32px] overflow-hidden p-10 md:p-12">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 text-emerald-600">
                <Globe className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Global Networking</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Connect with learners worldwide through cohort-based interactions and peer-to-peer accountability.
                </p>
              </div>
            </Card>

            <Card className="group relative bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-[32px] overflow-hidden p-10 md:p-12">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 text-rose-600">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Vested Oversight</h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  Advanced validation workflows ensure every certification and milestone is backed by genuine human review.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="relative overflow-hidden bg-slate-900 rounded-[48px] p-12 md:p-24 text-center space-y-8 shadow-3xl shadow-indigo-100">
            {/* Gradient Overlay */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
                Ready to elevate your <br /> <span className="text-indigo-400">knowledge grid?</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                Join a specialized cohort today and experience the future of professional education.
              </p>
              <div className="flex justify-center flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-[20px] px-10 h-16 text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-[20px] px-10 h-16 text-lg font-bold transition-all px-12">
                    Enter Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-50 bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold tracking-tight">DexterHub</div>
            </div>

            <div className="flex flex-wrap justify-center gap-10 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Ethics</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Service Protocols</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Architecture</Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">Licensing</Link>
            </div>

            <p className="text-sm font-semibold text-slate-400">© 2026 DEXTERHUB TECHNOLOGY. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
