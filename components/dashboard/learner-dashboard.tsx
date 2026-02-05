'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort, LearnerProgress } from '@/lib/api';
import { StatCard } from '@/components/stat-card';
import { CourseCard } from '@/components/course-card';
import { TaskCard } from '@/components/task-card';
import { TopHeader } from '@/components/top-header';
import { CalendarWidget } from '@/components/calendar-widget';
import { UpcomingEvents } from '@/components/upcoming-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Award, Users, TrendingUp, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { JoinCohortView } from '@/components/cohort-updates/join-cohort-view';
import { useRouter } from 'next/navigation';

export function LearnerDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [progress, setProgress] = useState<LearnerProgress | null>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [needsCohort, setNeedsCohort] = useState(false);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (user?.id) {
                const [progressData, tasksData] = await Promise.all([
                    api.getLearnerProgress(user.id),
                    api.getLearnerTasks(user.id)
                ]);

                setTasks(tasksData);

                // Check for active progress
                const activeProgress = progressData.find(p =>
                    p.status === 'on-track' || p.status === 'at-risk' || p.status === 'under-review'
                );

                if (activeProgress) {
                    setProgress(activeProgress);
                    if (activeProgress.cohortId) {
                        const cohortData = await api.getCohort(activeProgress.cohortId);
                        setCohort(cohortData);
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
            <div className="space-y-6 p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (needsCohort) {
        return <JoinCohortView onJoinSuccess={loadData} />;
    }

    // Mock data for demonstration - To be replaced with real API when available
    const upcomingEvents = [
        {
            id: '1',
            title: 'Psychology Exam',
            subtitle: 'Carry out writing exams in school',
            date: '19 Jan',
            duration: '45 Minutes',
            type: 'exam' as const,
            icon: '📝',
        },
        // ... more events
    ];

    const todayTasks = [
        {
            title: 'Quiz if you become a motivator',
            subject: 'Biography',
            instructor: 'Mrs Diana Smith',
            type: 'Task' as const,
            status: 'pending' as const,
            color: 'mint' as const,
        },
        // ... more tasks
    ];

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-12 text-white shadow-xl">
                    <div className="relative z-10 max-w-2xl space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-lg text-white/90">
                            You're making great progress. You have <span className="font-bold text-white">{tasks.length} tasks</span> pending review today.
                        </p>

                        {progress?.status === 'at-risk' && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm backdrop-blur-md border border-white/10">
                                <AlertCircle className="h-4 w-4" />
                                <span>Action Needed: Detailed review required</span>
                            </div>
                        )}
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 blur-3xl" />
                    <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-50" />
                </div>

                {/* Stats Section */}
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" /> Your Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={BookOpen}
                            label="Active Courses"
                            value={cohort?.courseIds ? (cohort.courseIds as any[]).length : 0}
                            iconColor="text-violet-600"
                            iconBgColor="bg-violet-50"
                        />
                        <StatCard
                            icon={GraduationCap}
                            label="Completed Modules"
                            value={progress?.completedLessons?.length || 0}
                            iconColor="text-emerald-600"
                            iconBgColor="bg-emerald-50"
                        />
                        <StatCard
                            icon={Award}
                            label="Current Average"
                            value={`${progress?.currentScore ? Math.round(progress.currentScore) : 0}%`}
                            iconColor="text-amber-600"
                            iconBgColor="bg-amber-50"
                        />
                        <StatCard
                            icon={Users}
                            label="Cohort Peers"
                            value={cohort?.learnerIds?.length || 0}
                            iconColor="text-blue-600"
                            iconBgColor="bg-blue-50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Courses */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold tracking-tight">Active Courses</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cohort && cohort.courseIds && (cohort.courseIds as any[]).length > 0 ? (
                                    (cohort.courseIds as any[]).map((course: any) => (
                                        <div key={course._id} onClick={() => router.push(`/dashboard/courses/${course._id}`)} className="cursor-pointer">
                                            <CourseCard
                                                title={course.name}
                                                subtitle={course.description?.substring(0, 60) + '...'}
                                                icon="💻"
                                                progress={progress?.currentScore || 0}
                                                duration={`${course.duration || 0}h`}
                                                instructor="DexterHub"
                                                color="lavender"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 rounded-xl border-dashed border-2 p-8 text-center text-muted-foreground bg-muted/30">
                                        No courses assigned to your cohort yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tasks */}
                        <div>
                            <h2 className="text-xl font-bold tracking-tight mb-4">Pending Assignments</h2>
                            <div className="space-y-3">
                                {tasks.length > 0 ? (
                                    tasks.map((task: any) => (
                                        <div key={task.id} className="group relative overflow-hidden rounded-xl border bg-white p-4 transition-all hover:shadow-md hover:border-indigo-200">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-foreground">{task.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{task.subject || 'Assignment'}</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => router.push(`/dashboard/courses/${cohort?.courseIds?.[0]?._id}`)}>
                                                    Resume
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-slate-50">
                                        <p>🎉 All caught up! No pending tasks.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border bg-white p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" /> Schedule
                            </h3>
                            <CalendarWidget
                                events={[
                                    { date: new Date(), type: 'exam' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
