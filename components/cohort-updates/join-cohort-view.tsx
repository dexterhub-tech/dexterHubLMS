'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ArrowRight, Sparkles, BookOpen, Clock, Globe, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function JoinCohortView({ onJoinSuccess }: { onJoinSuccess: () => void }) {
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState<string | null>(null);

    useEffect(() => {
        const loadCohorts = async () => {
            try {
                const data = await api.getCohorts();
                const available = data.filter(c => c.status === 'upcoming' || c.status === 'active');
                setCohorts(available);
            } catch (error) {
                console.error('Error loading cohorts:', error);
                toast.error('Failed to load available cohorts');
            } finally {
                setIsLoading(false);
            }
        };

        loadCohorts();
    }, []);

    const handleJoin = async (cohortId: string) => {
        setIsJoining(cohortId);
        try {
            await api.joinCohort(cohortId);
            toast.success('Successfully joined the cohort!');
            onJoinSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to join cohort');
        } finally {
            setIsJoining(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="space-y-6 text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                        <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing Opportunities</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/30">
            {/* Elegant Hero Section */}
            <section className="relative pt-20 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60 -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-50 rounded-full blur-[100px] opacity-40 translate-y-1/4 -translate-x-1/4" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border font-medium border-slate-100 shadow-sm text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5" /> Secure Academic Gateway
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold font-black tracking-tight text-slate-900 leading-[1.1]">
                        Welcome to Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Learning Journey.</span>
                    </h1>
                    <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        You're one step away from joining our elite community. Select an available cohort below to gain immediate access to your curriculum and peers.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto pb-32 px-4 md:px-6">
                <div className="md:grid md:gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {cohorts.map((cohort) => (
                        <div key={cohort._id} className="group relative">
                            {/* Card Background Bloom */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[40px] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />

                            <Card className="relative h-full bg-white rounded-[40px] border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex justify-between items-start mb-8">
                                        <Badge className={cn(
                                            "rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] border-none shadow-none",
                                            cohort.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-indigo-100 text-indigo-700'
                                        )}>
                                            {cohort.status === 'active' ? 'Ongoing Session' : 'Boarding Soon'}
                                        </Badge>
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-[11px] font-black text-slate-600">{cohort.learnerIds?.length || 0} Peers</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 font-medium leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {cohort.name}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-10 pb-10 space-y-8 flex-1">
                                    <p className="text-slate-500 font-medium leading-relaxed text-sm">
                                        {cohort.description || "Embark on a transformative learning experience designed to accelerate your career in technology."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-neutral-50/50 rounded-2xl md:p-5 border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commences</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 leading-none">
                                                {new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="bg-neutral-50/50 rounded-2xl md:p-5 border border-slate-100/50 group-hover:bg-white transition-colors duration-500">
                                            <div className="flex items-center gap-3 mb-2">
                                                <BookOpen className="w-4 h-4 text-violet-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope</span>
                                            </div>
                                            <p className="text-sm font-black text-slate-900 leading-none uppercase">
                                                {cohort.courseIds?.length || 0} Modules
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="px-10 pb-10 pt-0">
                                    <Button
                                        className={cn(
                                            "w-full h-16 rounded-2xl text-sm font-black uppercase tracking-[0.1em] shadow-xl transition-all active:scale-95 group-hover:shadow-indigo-200/50",
                                            cohort.status === 'active'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                        )}
                                        onClick={() => handleJoin(cohort._id)}
                                        disabled={!!isJoining}
                                    >
                                        {isJoining === cohort._id ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Requesting Access...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                Enter Cohort Workspace
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                            </div>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ))}

                    {cohorts.length === 0 && (
                        <div className="col-span-full py-32 px-10 bg-white rounded-[40px] border border-dashed border-slate-200 text-center space-y-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-slate-50/50 group-hover:scale-105 transition-transform duration-1000" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50 mb-8 border border-slate-50">
                                    <Globe className="w-10 h-10 text-slate-300 animate-pulse" />
                                </div>
                                <div className="max-w-md mx-auto space-y-4">
                                    <h3 className="text-2xl font-black font-medium text-slate-900 uppercase tracking-tight">Waitlist Currently Active</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        We're currently preparing the next series of intensive learning cycles. Register your interest to be the first notified when enrollment re-opens.
                                    </p>
                                    <Button variant="outline" className="rounded-xl px-10 h-12 font-black uppercase tracking-widest text-[10px] border-slate-200 hover:bg-slate-50">
                                        Get Notified
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
