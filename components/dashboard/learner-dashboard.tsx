'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort, LearnerProgress, Event } from '@/lib/api';
import { StatCard } from '@/components/stat-card';
import { CourseCard } from '@/components/course-card';
import { TaskCard } from '@/components/task-card';
import { TopHeader } from '@/components/top-header';
import { CalendarWidget } from '@/components/calendar-widget';
import { UpcomingEvents } from '@/components/upcoming-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Award, Users, TrendingUp, AlertCircle, FileText, Calendar, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { JoinCohortView } from '@/components/cohort-updates/join-cohort-view';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LearnerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [progress, setProgress] = useState<LearnerProgress | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsCohort, setNeedsCohort] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (user?.id) {
                const [progressData, tasksData, eventsData] = await Promise.all([
                    api.getLearnerProgress(user.id),
                    api.getLearnerTasks(user.id),
                    api.getEvents() // Get global events or filter by cohort below
                ]);

                setTasks(tasksData);

                // Filter for active progress
                const activeProgress = progressData.find(p =>
                    p.status === 'on-track' || p.status === 'at-risk' || p.status === 'under-review'
                );

                if (activeProgress) {
                    setProgress(activeProgress);
                    if (activeProgress.cohortId) {
                        const cohortData = await api.getCohort(activeProgress.cohortId);
                        setCohort(cohortData);

                        // Filter events for this specific cohort
                        const cohortEvents = eventsData.filter(e => e.cohortId === activeProgress.cohortId);
                        setEvents(cohortEvents);
                    }
                    setNeedsCohort(false);
                } else {
                    setNeedsCohort(true);
                }
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
                <div className="p-8 space-y-8 max-w-7xl mx-auto">
                    <div className="h-64 bg-slate-200 animate-pulse rounded-[32px] w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (needsCohort) {
        return <JoinCohortView onJoinSuccess={loadData} />;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-8 space-y-10">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[32px] bg-indigo-600 p-8 md:p-14 text-white shadow-2xl shadow-indigo-200">
                    <div className="relative z-10 max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> Learning Session Active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-50/90 leading-relaxed font-medium">
                            You're currently in the <span className="text-white font-bold underline underline-offset-4 decoration-indigo-300">{cohort?.name}</span> cohort.
                            {tasks.length > 0 ? ` You have ${tasks.length} assignments awaiting your focus today.` : " You're all caught up on your assignments!"}
                        </p>

                        {progress?.status === 'at-risk' && (
                            <div className="inline-flex items-center gap-3 rounded-2xl bg-rose-500/20 px-5 py-3 text-sm backdrop-blur-xl border border-rose-500/30">
                                <AlertCircle className="h-5 w-5 text-rose-200" />
                                <span className="font-semibold text-rose-50">Performance Alert: Review mandatory tasks to maintain status.</span>
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            <Button onClick={() => router.push('/dashboard/courses')} className="rounded-xl h-12 px-8 bg-white text-indigo-600 hover:bg-slate-50 font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-all">
                                Continue Lessons
                            </Button>
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-indigo-400 blur-3xl opacity-30 animate-pulse" />
                    <div className="absolute top-10 right-10 flex h-32 w-32 items-center justify-center rounded-full bg-white/5 border border-white/10 blur-xl" />
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3 text-slate-900">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            Performance Metrics
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={BookOpen}
                            label="Active Modules"
                            value={cohort?.courseIds?.length || 0}
                            iconColor="text-violet-600"
                            iconBgColor="bg-violet-50"
                        />
                        <StatCard
                            icon={GraduationCap}
                            label="Milestones"
                            value={progress?.completedLessons?.length || 0}
                            iconColor="text-emerald-600"
                            iconBgColor="bg-emerald-50"
                        />
                        <StatCard
                            icon={Award}
                            label="Current Score"
                            value={`${progress?.currentScore ? Math.round(progress.currentScore) : 0}%`}
                            iconColor="text-amber-600"
                            iconBgColor="bg-amber-50"
                        />
                        <StatCard
                            icon={Users}
                            label="Network Size"
                            value={cohort?.learnerIds?.length || 0}
                            iconColor="text-blue-600"
                            iconBgColor="bg-blue-50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Current Courses */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between lg:pr-4">
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    Assigned Curriculum
                                </h2>
                                <Button variant="ghost" onClick={() => router.push('/dashboard/courses')} className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl">Explore All</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cohort && cohort.courseIds && cohort.courseIds.length > 0 ? (
                                    (cohort.courseIds as any[]).map((course: any) => (
                                        <div key={course._id} onClick={() => router.push(`/dashboard/courses/${course._id}`)} className="cursor-pointer group">
                                            <CourseCard
                                                title={course.name}
                                                subtitle={course.description?.substring(0, 100) + '...'}
                                                icon="📚"
                                                progress={progress?.currentScore || 0}
                                                duration={`${course.duration || 0}h Total`}
                                                instructor="DexterHub Faculty"
                                                color="lavender"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-[32px] border-dashed border-2 border-slate-200 p-14 text-center space-y-4 bg-slate-50/50">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <BookOpen className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <p className="font-semibold text-slate-900">Waitlist Active</p>
                                            <p className="text-slate-500 mt-1 text-sm leading-relaxed">Your curriculum is being finalized by the instructors. Check back soon.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                Required Submissions
                            </h2>
                            <div className="space-y-4">
                                {tasks.length > 0 ? (
                                    tasks.map((task: any) => (
                                        <div key={task.id} className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 transition-all hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1">
                                            <div className="flex items-center gap-6">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                    <FileText className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-slate-100">{task.type || 'Standard'}</Badge>
                                                        {task.priority === 'high' && <Badge className="bg-rose-50 text-rose-600 border-rose-100 text-[9px] font-bold uppercase tracking-widest">Priority</Badge>}
                                                    </div>
                                                    <h4 className="font-semibold text-lg text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">Domain: {task.subject || 'LMS Core'}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="rounded-xl px-5 h-10 font-bold border-slate-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-50" onClick={() => router.push(`/dashboard/courses/${cohort?.courseIds?.[0]}`)}>
                                                    Open Ref
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-[32px] border border-dashed border-slate-200 p-14 text-center bg-emerald-50/30 space-y-3">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-emerald-900">Schedule Clear</p>
                                            <p className="text-emerald-600/70 text-sm">All tasks for the current cycle have been processed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8 sticky top-24">
                        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    Academic Log
                                </h3>
                                <p className="text-sm text-slate-500">Track your attendance and deadlines</p>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50">
                                <CalendarWidget
                                    events={events.map(e => ({
                                        date: new Date(e.date),
                                        type: e.type as any
                                    }))}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <UpcomingEvents
                                    events={events.map(e => ({
                                        id: e._id,
                                        title: e.title,
                                        subtitle: e.description || 'LMS Event',
                                        date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                        duration: e.duration,
                                        type: e.type as any,
                                        icon: e.icon
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Motivation Card */}
                        <div className="rounded-[32px] bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white relative overflow-hidden group shadow-lg shadow-indigo-100">
                            <div className="relative z-10 space-y-4">
                                <h4 className="text-lg font-bold leading-tight italic">"The beautiful thing about learning is that nobody can take it away from you."</h4>
                                <div className="h-1 w-12 bg-white/30 rounded-full" />
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">— B.B. King</p>
                            </div>
                            <Award className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
