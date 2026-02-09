'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    XCircle,
    User,
    BookOpen,
    Calendar,
    ArrowLeft,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Application {
    _id: string;
    learnerId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    courseId: {
        _id: string;
        name: string;
        icon?: string;
        color?: string;
    };
    cohortId: {
        _id: string;
        name: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

interface ApplicationsListProps {
    backLink?: string;
    backLabel?: string;
}

export function ApplicationsList({ backLink, backLabel }: ApplicationsListProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            setIsLoading(true);
            const data = await api.getPendingApplications();
            setApplications(data);
        } catch (error) {
            console.error('Error loading applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApplication = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            await api.handleApplication(id, action);
            toast.success(`Application ${action}d successfully!`);
            fetchApplications(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} application`);
        } finally {
            setProcessingId(null);
        }
    };

    const pendingApps = applications.filter(a => a.status === 'pending');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
                <div className="p-8 space-y-8 max-w-5xl mx-auto">
                    <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/3" />
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[24px]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-5xl mx-auto p-8 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        {backLink && (
                            <button
                                onClick={() => router.push(backLink)}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {backLabel || 'Back'}
                            </button>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">
                                Course Enrollment
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Enrollment Applications</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl text-base">
                            Review and approve learner requests to enroll in courses.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm">
                            <span className="text-sm text-slate-500">Pending:</span>
                            <span className="ml-2 font-bold text-indigo-600">{pendingApps.length}</span>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                    {pendingApps.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 border border-slate-100 shadow-sm text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">All Caught Up!</h3>
                            <p className="text-slate-500 mt-2">No pending enrollment applications</p>
                        </div>
                    ) : (
                        pendingApps.map((app) => (
                            <div
                                key={app._id}
                                className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Applicant Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                                            {app.learnerId?.firstName?.[0]}{app.learnerId?.lastName?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 text-lg">
                                                {app.learnerId?.firstName} {app.learnerId?.lastName}
                                            </h4>
                                            <p className="text-sm text-slate-500">{app.learnerId?.email}</p>

                                            {/* Course & Cohort */}
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700">{app.courseId?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-600">{app.cohortId?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            {app.reason && (
                                                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Motivation</span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed">{app.reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                                        <Button
                                            onClick={() => handleApplication(app._id, 'approve')}
                                            disabled={processingId === app._id}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 flex-1 lg:flex-none"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            {processingId === app._id ? 'Processing...' : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleApplication(app._id, 'reject')}
                                            disabled={processingId === app._id}
                                            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl h-11 px-6 flex-1 lg:flex-none"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
