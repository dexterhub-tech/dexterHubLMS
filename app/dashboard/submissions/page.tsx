'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Video, CheckCircle, Clock, Loader2, Filter, Award, TrendingUp, Users, Search, ChevronRight, GraduationCap, Edit3, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TopHeader } from '@/components/top-header';

export default function SubmissionsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [cohortFilter, setCohortFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Grading Dialog
    const [gradingSubmission, setGradingSubmission] = useState<any>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isGrading, setIsGrading] = useState(false);

    useEffect(() => {
        if (user?.role !== 'instructor' && user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchSubmissions();
    }, [user, router]);

    const fetchSubmissions = async () => {
        try {
            setIsLoading(true);
            const data = await api.getAllSubmissions();
            setSubmissions(data);
            setFilteredSubmissions(data);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let filtered = [...submissions];

        if (cohortFilter !== 'all') {
            filtered = filtered.filter(s => s.cohortId?._id === cohortFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (typeFilter !== 'all') {
            if (typeFilter === 'quiz') {
                filtered = filtered.filter(s => s.lessonId?.assignment?.type === 'quiz');
            } else {
                filtered = filtered.filter(s => s.lessonId?.assignment?.type !== 'quiz');
            }
        }

        setFilteredSubmissions(filtered);
    }, [cohortFilter, statusFilter, typeFilter, submissions]);

    const handleGrade = async () => {
        if (!gradingSubmission || !grade) {
            toast.error('Please enter a grade');
            return;
        }

        const gradeNum = parseFloat(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 10) {
            toast.error('Grade must be between 0 and 10');
            return;
        }

        try {
            setIsGrading(true);
            await api.gradeSubmission({
                submissionId: gradingSubmission._id,
                grade: gradeNum,
                feedback
            });

            toast.success('Submission graded successfully');
            setGradingSubmission(null);
            setGrade('');
            setFeedback('');
            fetchSubmissions();
        } catch (error: any) {
            toast.error(error.message || 'Failed to grade submission');
        } finally {
            setIsGrading(false);
        }
    };

    const getAssignmentType = (submission: any) => {
        return submission.lessonId?.assignment?.type === 'quiz' ? 'Quiz' : 'File/Video';
    };

    const getStatusBadge = (submission: any) => {
        if (submission.status === 'graded') {
            return (
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-none">
                    Graded
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-none">
                Pending Review
            </Badge>
        );
    };

    const uniqueCohorts = Array.from(new Set(submissions.map(s => s.cohortId?._id).filter(Boolean)));

    // Calculate stats
    const pendingCount = submissions.filter(s => s.status === 'pending').length;
    const gradedCount = submissions.filter(s => s.status === 'graded').length;
    const avgGrade = gradedCount > 0
        ? (submissions.filter(s => s.status === 'graded').reduce((acc, s) => acc + (s.grade || 0), 0) / gradedCount).toFixed(1)
        : '0.0';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50/50">
                <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                            Submissions
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-xl text-sm md:text-lg font-medium">
                            Review, grade, and provide feedback on student academic work.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'indigo', sub: 'Across all cohorts' },
                        { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'amber', sub: 'Requires grading' },
                        { label: 'Graded Work', value: gradedCount, icon: CheckCircle, color: 'emerald', sub: 'Completed reviews' },
                        { label: 'Avg Academic Grade', value: `${avgGrade}/10`, icon: Award, color: 'violet', sub: 'Learner performance' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-3 rounded-2xl transition-colors",
                                    stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                    stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-violet-50 text-violet-600'
                                )}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-semibold text-slate-900">{stat.value}</span>
                                    <span className="text-[11px] text-slate-400 font-medium">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm">
                    <div className="flex-1 flex items-center gap-4 px-4">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
                             <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cohort:</span>
                                <Select value={cohortFilter} onValueChange={setCohortFilter}>
                                    <SelectTrigger className="border-none bg-transparent shadow-none h-8 p-0 text-xs font-bold text-slate-900 focus:ring-0 w-fit gap-2">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        <SelectItem value="all">All Cohorts</SelectItem>
                                        {uniqueCohorts.map(cohortId => {
                                            const cohort = submissions.find(s => s.cohortId?._id === cohortId)?.cohortId;
                                            return (
                                                <SelectItem key={cohortId as string} value={cohortId as string}>
                                                    {cohort?.name || 'Unknown'}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="h-4 w-px bg-slate-100" />

                             <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="border-none bg-transparent shadow-none h-8 p-0 text-xs font-bold text-slate-900 focus:ring-0 w-fit gap-2">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending Review</SelectItem>
                                        <SelectItem value="graded">Graded</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="h-4 w-px bg-slate-100" />

                             <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type:</span>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="border-none bg-transparent shadow-none h-8 p-0 text-xs font-bold text-slate-900 focus:ring-0 w-fit gap-2">
                                        <SelectValue placeholder="All" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="quiz">Quiz Assessment</SelectItem>
                                        <SelectItem value="file">Manual Submission</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <div className="px-4 text-xs font-bold text-indigo-600">
                        {filteredSubmissions.length} Results
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-50">
                                    <TableHead className="h-14 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner Information</TableHead>
                                    <TableHead className="h-14 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Lesson</TableHead>
                                    <TableHead className="h-14 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Type</TableHead>
                                    <TableHead className="h-14 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted Date</TableHead>
                                    <TableHead className="h-14 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="h-14 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</TableHead>
                                    <TableHead className="h-14 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-24 text-slate-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-900">No submissions matching criteria</p>
                                                    <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <TableRow key={submission._id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                        {submission.learnerId?.firstName?.[0]}{submission.learnerId?.lastName?.[0]}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="font-bold text-slate-900 leading-none">
                                                            {submission.learnerId?.firstName} {submission.learnerId?.lastName}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                                            <GraduationCap className="w-3 h-3" />
                                                            {submission.cohortId?.name || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-slate-800 leading-none truncate max-w-[180px]">
                                                        {submission.lessonId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium">Module Curriculum</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-center">
                                                <div className="flex justify-center">
                                                    {getAssignmentType(submission) === 'Quiz' ? (
                                                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600" title="Quiz Assessment">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600" title="Manual Submission">
                                                            <Video className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="text-[13px] font-bold text-slate-600">
                                                    {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    {new Date(submission.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                {getStatusBadge(submission)}
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                {submission.status === 'graded' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-xl text-slate-900 tracking-tight">
                                                            {submission.grade}
                                                            <span className="text-slate-300 text-sm font-bold ml-0.5">/10</span>
                                                        </span>
                                                        {getAssignmentType(submission) === 'Quiz' && (
                                                            <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center text-blue-600" title="System Auto-Graded">
                                                                <TrendingUp className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200 font-black">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                {submission.status === 'pending' && getAssignmentType(submission) !== 'Quiz' ? (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setGradingSubmission(submission);
                                                            setGrade('');
                                                            setFeedback('');
                                                        }}
                                                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-xs px-5 h-9 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                                    >
                                                        Review & Grade
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setGradingSubmission(submission);
                                                            setGrade(submission.grade?.toString() || '');
                                                            setFeedback(submission.feedback || '');
                                                        }}
                                                        className="rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 px-4 h-9"
                                                    >
                                                        {submission.status === 'graded' ? (
                                                            <span className="flex items-center gap-2"><Edit3 className="w-3.5 h-3.5" />Edit Grade</span>
                                                        ) : (
                                                            <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" />View Only</span>
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Grading Dialog */}
            <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">Academic Review</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-sm">
                                Reviewing submission for <span className="text-indigo-600 font-bold">{gradingSubmission?.learnerId?.firstName} {gradingSubmission?.learnerId?.lastName}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Content</Label>
                                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                                        {getAssignmentType(gradingSubmission || {})}
                                    </Badge>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                                    <p className="text-sm text-slate-700 break-all leading-relaxed font-medium italic">
                                        "{gradingSubmission?.content || 'No content provided.'}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {gradingSubmission?.submittedAt && new Date(gradingSubmission.submittedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="grade" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign Score (0-10)</Label>
                                        {grade && (
                                            <span className={cn(
                                                "text-xs font-black",
                                                parseFloat(grade) >= 5 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {parseFloat(grade) >= 5 ? 'PASSING' : 'FAILING'}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="grade"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        placeholder="0.0"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:ring-indigo-500 font-black text-xl text-slate-900 px-6 text-center w-full"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="feedback" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Feedback</Label>
                                    <Textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide constructive feedback..."
                                        rows={4}
                                        className="rounded-2xl border-slate-100 bg-slate-50 focus:ring-indigo-500 font-medium text-slate-700 p-4 resize-none min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50 p-8 pt-6 flex flex-row gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setGradingSubmission(null)}
                            disabled={isGrading}
                            className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGrade}
                            disabled={isGrading}
                            className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            {isGrading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    PROCESSING...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    SUBMIT GRADE
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
