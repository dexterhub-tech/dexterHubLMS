'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TopHeader } from '@/components/top-header';
import { toast } from 'sonner';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    Plus,
    BookOpen,
    Users,
    TrendingUp,
    MoreHorizontal,
    ArrowUpRight,
    GraduationCap,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for Charts
const GROWTH_DATA = [
    { name: 'Jan', students: 100 },
    { name: 'Feb', students: 155 },
    { name: 'Mar', students: 230 },
    { name: 'Apr', students: 200 },
    { name: 'May', students: 210 },
    { name: 'Jun', students: 300 },
    { name: 'Jul', students: 390 },
    { name: 'Aug', students: 350 },
    { name: 'Sep', students: 375 },
    { name: 'Oct', students: 200 },
    { name: 'Nov', students: 340 },
    { name: 'Dec', students: 280 },
];

const ACTIVITIES = [
    { title: 'New Course Enrollment', sub: 'James enrolled in "UI Design Basics"', time: '2 mins ago' },
    { title: 'New Message Alert', sub: 'You received a message from Ife', time: '2 hrs ago' },
    { title: 'Course Rating', sub: 'Sandra rated "Design Basics" 5★', time: '3 hrs ago' },
    { title: 'Course Update', sub: 'You updated "Design Basics" yesterday', time: '3 hrs ago' },
];

export function InstructorDashboard() {
    const { user } = useAuth();
    const [cohorts, setCohorts] = useState<Cohort[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeCohorts: 0,
        avgCompletion: 68 // Mock avg
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                if (user?.id) {
                    const allCohorts = await api.getCohorts();
                    const myCohorts = allCohorts.filter(c => c.instructorIds.includes(user.id));
                    setCohorts(myCohorts);

                    const activeCohortsCount = myCohorts.filter(c => c.status === 'active').length;
                    const totalStudentsCount = myCohorts.reduce((acc, curr) => acc + (curr.learnerIds?.length || 0), 0);

                    setStats(prev => ({
                        ...prev,
                        totalStudents: totalStudentsCount,
                        activeCohorts: activeCohortsCount,
                    }));

                    // Fetch pending enrollment requests
                    const requests = await api.getPendingApplications();
                    setEnrollmentRequests(requests);
                }
            } catch (error) {
                console.error('Error loading instructor dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    const handleApplicationAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            await api.handleApplication(id, action);
            toast.success(`Application ${action}d!`);
            setEnrollmentRequests(prev => prev.filter(r => r._id !== id));
            // Refresh counts if approved
            if (action === 'approve') {
                // Re-run loadData or just update local stats
                setStats(prev => ({ ...prev, totalStudents: prev.totalStudents + 1 }));
            }
        } catch (error) {
            toast.error('Failed to process application');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome Back, {user?.firstName}!</h1>
                        <p className="text-slate-500 mt-1">Manage your courses, students, and track their growth.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/instructor/courses/new">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all rounded-xl h-11 px-6">
                                <Plus className="w-4 h-4 mr-2" /> Create Course
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +2 this month
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Courses</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{cohorts.length}</span>
                                    <span className="text-sm text-slate-400">active cohorts</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" /> +10 this month
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Students</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.totalStudents}</span>
                                    <span className="text-sm text-slate-400">across all cohorts</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                                </div>
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +6% improvement
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Completion</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stats.avgCompletion}%</span>
                                    <span className="text-sm text-slate-400">learner success</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2">
                        <Card className="rounded-2xl border-slate-100 shadow-sm h-full overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-slate-900">Student Growth</CardTitle>
                                        <CardDescription>Monthly student enrolment trends</CardDescription>
                                    </div>
                                    <select className="text-xs font-medium border-0 bg-slate-50 rounded-lg p-2.5 text-slate-600 outline-none ring-1 ring-slate-100 cursor-pointer">
                                        <option>This Year</option>
                                        <option>Last Year</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={GROWTH_DATA}>
                                            <defs>
                                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="students"
                                                stroke="#6366f1"
                                                strokeWidth={2.5}
                                                fillOpacity={1}
                                                fill="url(#colorStudents)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-1">
                        <Card className="rounded-2xl border-slate-100 shadow-sm h-full">
                            <CardHeader className="bg-white border-b border-slate-50">
                                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-8">
                                    {ACTIVITIES.map((activity, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors" />
                                                {i !== ACTIVITIES.length - 1 && <div className="w-0.5 grow bg-slate-100 mt-2 mb-2" />}
                                            </div>
                                            <div className="space-y-1 -mt-1">
                                                <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">{activity.sub}</p>
                                                <p className="text-[10px] text-slate-400 font-medium pt-0.5">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Enrollment Requests section */}
                {enrollmentRequests.length > 0 && (
                    <Card className="rounded-2xl border-indigo-100 bg-indigo-50/30 shadow-sm overflow-hidden">
                        <CardHeader className="bg-white/50 border-b border-indigo-50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                                <CardTitle className="text-lg font-semibold text-slate-900">Pending Enrollment Requests</CardTitle>
                                <Badge className="ml-2 bg-indigo-600 h-5 px-1.5">{enrollmentRequests.length}</Badge>
                            </div>
                            <CardDescription>Review learners application for your courses.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-indigo-50/50">
                                {enrollmentRequests.map((req) => (
                                    <div key={req._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/40 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                                                    {req.learnerId?.firstName?.[0]}{req.learnerId?.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-semibold text-slate-800">{req.learnerId?.firstName} {req.learnerId?.lastName}</div>
                                                <div className="text-xs text-slate-500">Applied for <span className="font-semibold text-indigo-600">{req.courseId?.name}</span> in {req.cohortId?.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-4"
                                                onClick={() => handleApplicationAction(req._id, 'approve')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl px-4"
                                                onClick={() => handleApplicationAction(req._id, 'reject')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Cohort Overview Table */}
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-900">Cohort Overview</CardTitle>
                                <CardDescription>Managing {cohorts.length} total active cohorts</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input className="w-64 h-10 pl-9 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all" placeholder="Search cohorts..." />
                                </div>
                                <Button variant="outline" size="sm" className="h-10 rounded-xl border-slate-200 px-4">
                                    <Filter className="w-4 h-4 mr-2" /> Filter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left">
                                        <th className="py-4 font-semibold text-xs text-slate-500 pl-8 uppercase tracking-wider">Cohort Name</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Learners</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Rating</th>
                                        <th className="py-4 font-semibold text-xs text-slate-500 pr-8 text-right uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {cohorts.map((cohort, i) => (
                                        <tr key={i} className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="py-5 pl-8">
                                                <div className="font-semibold text-slate-900">{cohort.name}</div>
                                                <div className="text-xs text-slate-400">{cohort.description}</div>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-700">{cohort.learnerIds?.length || 0}</span>
                                                    <span className="text-xs text-slate-400">enrolled</span>
                                                </div>
                                            </td>
                                            <td className="py-5">
                                                <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'}
                                                    className={`rounded-full px-3 py-0.5 font-medium shadow-none whitespace-nowrap
                                                        ${cohort.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {cohort.status === 'active' ? 'Active' : 'Draft'}
                                                </Badge>
                                            </td>
                                            <td className="py-5">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    4.8 <span className="text-amber-400">★</span>
                                                </div>
                                            </td>
                                            <td className="py-5 pr-8 text-right">
                                                <Link href={`/dashboard/cohorts/${cohort._id}`}>
                                                    <button className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-slate-400">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {cohorts.length === 0 && !isLoading && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                                No cohorts found. Create your first course to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
