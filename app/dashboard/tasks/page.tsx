'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopHeader } from '@/components/top-header';
import { TaskCard } from '@/components/task-card';
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TasksPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const data = await api.getLearnerTasks(user.id);
                const mappedTasks = data.map((t: any, i: number) => ({
                    ...t,
                    color: t.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
                    dueDate: t.dueDate || new Date().toISOString()
                }));
                setTasks(mappedTasks);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [user]);

    const handleTaskClick = (task: any) => {
        if (task.isLocked) return; // locked tasks are not clickable

        if (task.type === 'Assignment' && task.courseId && task.lessonId) {
            // Navigate to the course session page with the lessonId query param
            router.push(`/dashboard/courses/${task.courseId}?lessonId=${task.lessonId}`);
        } else {
            router.push(`/dashboard/tasks/${task.id}`);
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'submitted');

    const filteredTasks = tasks.filter(task =>
        (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderTaskItem = (task: any, index: number) => (
        <div
            key={index}
            onClick={() => handleTaskClick(task)}
            className={cn("relative", task.isLocked ? "cursor-not-allowed" : "cursor-pointer")}
        >
            {task.isLocked && (
                <div className="absolute inset-0 z-10 rounded-2xl bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-end pr-5 pointer-events-none">
                    <div className="flex items-center gap-1.5 bg-white/90 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        <Lock className="w-3 h-3" />
                        <span>Complete previous module first</span>
                    </div>
                </div>
            )}
            <div className={cn(task.isLocked && "opacity-60 select-none pointer-events-none")}>
                <TaskCard {...task} />
            </div>
        </div>
    );

    const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) => (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-lg font-medium text-slate-900">{title}</h3>
            <p className="text-slate-500">{subtitle}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">My Tasks</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
                            Track your assignments, quizzes, and deadlines.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-2xl font-semibold text-orange-600">{pendingTasks.length}</span>
                            <span className="text-xs uppercase font-semibold text-slate-500">Pending</span>
                        </div>
                        <div className="flex flex-col items-center bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-2xl font-semibold text-emerald-600">{completedTasks.length}</span>
                            <span className="text-xs uppercase font-semibold text-slate-500">Done</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search tasks by title or subject..."
                            className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <div className="relative">
                        <TabsList className="bg-slate-100/50 p-1 mb-6 md:mb-8 h-auto rounded-xl w-full flex overflow-x-auto overflow-y-hidden no-scrollbar justify-start md:justify-start gap-1">
                            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 md:px-6 py-2 text-xs md:text-sm font-bold whitespace-nowrap">All Tasks ({tasks.length})</TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 md:px-6 py-2 text-xs md:text-sm font-bold whitespace-nowrap">Pending ({pendingTasks.length})</TabsTrigger>
                            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 md:px-6 py-2 text-xs md:text-sm font-bold whitespace-nowrap">Completed ({completedTasks.length})</TabsTrigger>
                        </TabsList>
                    </div>

                    {isLoading ? (
                        <div className="my-10 text-center text-muted-foreground">Loading tasks...</div>
                    ) : (
                        <>
                            <TabsContent value="all" className="mt-0 space-y-4">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task, index) => renderTaskItem(task, index))
                                ) : (
                                    <EmptyState icon="📝" title="No tasks found" subtitle="You are all caught up!" />
                                )}
                            </TabsContent>

                            <TabsContent value="pending" className="mt-0 space-y-4">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map((task, index) => renderTaskItem(task, index))
                                ) : (
                                    <EmptyState icon="🎉" title="No pending tasks" subtitle="Great job staying on top of your work!" />
                                )}
                            </TabsContent>

                            <TabsContent value="completed" className="mt-0 space-y-4">
                                {completedTasks.length > 0 ? (
                                    completedTasks.map((task, index) => renderTaskItem(task, index))
                                ) : (
                                    <EmptyState icon="📂" title="No completed tasks yet" subtitle="Finish your first assignment to see it here." />
                                )}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
