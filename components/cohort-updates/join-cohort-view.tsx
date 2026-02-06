'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ArrowRight, Sparkles, BookOpen, Clock } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
                <div className="space-y-4 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium animate-pulse">Scanning for opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 py-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        <Sparkles className="w-3 h-3" /> Get Started
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">Choose Your Learning Path</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Select an active academic group to begin your journey. Each cohort offers a unique schedule and peer network.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {cohorts.map((cohort) => (
                        <Card key={cohort._id} className="group relative flex flex-col bg-white rounded-[32px] border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                            {/* Card Decor */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
                                cohort.status === 'active' ? 'bg-emerald-500' : 'bg-indigo-500'
                            )} />

                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className={cn(
                                        "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest border transition-colors",
                                        cohort.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                    )}>
                                        {cohort.status === 'active' ? 'Ongoing Session' : 'Enrolling Soon'}
                                    </Badge>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-600">{cohort.learnerIds?.length || 0} Peers</span>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {cohort.name}
                                </CardTitle>
                                <CardDescription className="mt-3 text-slate-500 leading-relaxed line-clamp-2 italic">
                                    "{cohort.description}"
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8 pt-4 flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Launch Date</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            {new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Curriculum</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                                            <BookOpen className="w-4 h-4 text-indigo-500" />
                                            {cohort.courseIds?.length || 0} Modules
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="p-8 pt-0">
                                <Button
                                    className={cn(
                                        "w-full h-14 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-95",
                                        cohort.status === 'active'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                                    )}
                                    onClick={() => handleJoin(cohort._id)}
                                    disabled={!!isJoining}
                                >
                                    {isJoining === cohort._id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Initializing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Start Your Journey
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {cohorts.length === 0 && (
                        <div className="col-span-full py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Quiet for a Moment</h3>
                                <p className="text-slate-500 mt-1">No new cohorts are currently enrolling. Please check back later.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
