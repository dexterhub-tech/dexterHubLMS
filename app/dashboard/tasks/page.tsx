'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopHeader } from '@/components/top-header';
import { TaskCard } from '@/components/task-card';
import { useAuth } from '@/lib/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function TasksPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const MOCK_TASKS = [
        {
            id: 'mock-1',
            title: 'CBT Exam: Advanced HTML & Accessibility',
            subject: 'Frontend Dev',
            instructor: 'Prof. Sarah Smith',
            type: 'quiz',
            status: 'pending',
            color: 'mint',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
        },
        {
            id: 'mock-2',
            title: 'Project Submission: Portfolio Website',
            subject: 'UI/UX Design',
            instructor: 'Dr. Alex Chen',
            type: 'task',
            status: 'pending',
            color: 'peach',
            dueDate: new Date(Date.now() + 172800000).toISOString(),
        },
        {
            id: 'mock-3',
            title: 'Video Presentation: Self Introduction',
            subject: 'Communication',
            instructor: 'Ms. Emily White',
            type: 'video',
            status: 'completed',
            color: 'lavender',
            dueDate: new Date(Date.now() - 86400000).toISOString(),
        }
    ];

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) {
                // Show mock data even if user not fully loaded for demo
                setTasks(MOCK_TASKS);
                setIsLoading(false);
                return;
            }
            try {
                const data = await api.getLearnerTasks(user.id);
                const mappedTasks = data.map((t: any, i: number) => ({
                    title: t.title || t.assignment?.title || 'Untitled Task',
                    subject: t.courseName || 'General',
                    instructor: t.instructorName || 'Instructor',
                    type: (t.type || 'Task') as 'Task' | 'Theory' | 'Assignment',
                    status: (t.isCompleted ? 'completed' : 'pending') as 'pending' | 'completed',
                    color: t.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
                    dueDate: t.dueDate || new Date().toISOString(),
                    id: t._id || t.lessonId
                }));
                setTasks([...mappedTasks, ...MOCK_TASKS]);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                setTasks(MOCK_TASKS);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [user]);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subject.toLowerCase().includes(searchTerm.toLowerCase())
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

                {/* Search and Filters */}
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
                                    filteredTasks.map((task, index) => (
                                        <div key={index} onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                                            <TaskCard {...task} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="text-4xl mb-4">📝</div>
                                        <h3 className="text-lg font-medium text-slate-900">No tasks found</h3>
                                        <p className="text-slate-500">You are all caught up!</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="pending" className="mt-0 space-y-4">
                                {pendingTasks.length > 0 ? (
                                    pendingTasks.map((task, index) => (
                                        <div key={index} onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                                            <TaskCard {...task} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="text-4xl mb-4">🎉</div>
                                        <h3 className="text-lg font-medium text-slate-900">No pending tasks</h3>
                                        <p className="text-slate-500">Great job staying on top of your work!</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="completed" className="mt-0 space-y-4">
                                {completedTasks.length > 0 ? (
                                    completedTasks.map((task, index) => (
                                        <div key={index} onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                                            <TaskCard {...task} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <div className="text-4xl mb-4">📂</div>
                                        <h3 className="text-lg font-medium text-slate-900">No completed tasks yet</h3>
                                        <p className="text-slate-500">Finish your first assignment to see it here.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
