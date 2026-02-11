'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
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
import { FileText, Video, CheckCircle, Clock, Loader2, Filter, Award, TrendingUp, Users } from 'lucide-react';
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
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold shadow-sm">
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    Graded
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 font-bold shadow-sm">
                <Clock className="w-3 h-3 mr-1.5" />
                Pending
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

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">
                            Submissions
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
                            Review and grade all student submissions across your cohorts
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Graded</p>
                                    <p className="text-2xl font-bold text-emerald-700 mt-1">{gradedCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">Avg Grade</p>
                                    <p className="text-2xl font-bold text-violet-700 mt-1">{avgGrade}/10</p>
                                </div>
                                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-violet-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2 font-bold text-slate-900">
                            <Filter className="w-4 h-4 text-indigo-600" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cohort</Label>
                            <Select value={cohortFilter} onValueChange={setCohortFilter}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 font-medium">
                                    <SelectValue placeholder="All Cohorts" />
                                </SelectTrigger>
                                <SelectContent>
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

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 font-medium">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="graded">Graded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-11 font-medium">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                    <SelectItem value="file">File/Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card className="border-slate-100 shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                        <TableHead className="font-bold text-slate-700">Learner</TableHead>
                                        <TableHead className="font-bold text-slate-700">Cohort</TableHead>
                                        <TableHead className="font-bold text-slate-700">Lesson</TableHead>
                                        <TableHead className="font-bold text-slate-700">Type</TableHead>
                                        <TableHead className="font-bold text-slate-700">Submitted</TableHead>
                                        <TableHead className="font-bold text-slate-700">Status</TableHead>
                                        <TableHead className="font-bold text-slate-700">Score</TableHead>
                                        <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubmissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <FileText className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <p className="font-medium">No submissions found</p>
                                                    <p className="text-sm text-slate-400">Try adjusting your filters</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSubmissions.map((submission) => (
                                            <TableRow key={submission._id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-semibold text-slate-900">
                                                    {submission.learnerId?.firstName} {submission.learnerId?.lastName}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    <Badge variant="outline" className="font-medium">
                                                        {submission.cohortId?.name || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-700 font-medium">
                                                    {submission.lessonId?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getAssignmentType(submission) === 'Quiz' ? (
                                                            <>
                                                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-indigo-600" />
                                                                </div>
                                                                <span className="font-medium text-slate-700">Quiz</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                                                                    <Video className="w-4 h-4 text-violet-600" />
                                                                </div>
                                                                <span className="font-medium text-slate-700">File/Video</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 text-sm">
                                                    {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(submission)}</TableCell>
                                                <TableCell>
                                                    {submission.status === 'graded' ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg text-slate-900">
                                                                {submission.grade}
                                                                <span className="text-slate-400 text-sm font-normal">/10</span>
                                                            </span>
                                                            {getAssignmentType(submission) === 'Quiz' && (
                                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-bold">
                                                                    Auto
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 font-medium">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {submission.status === 'pending' && getAssignmentType(submission) !== 'Quiz' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setGradingSubmission(submission);
                                                                setGrade('');
                                                                setFeedback('');
                                                            }}
                                                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-sm"
                                                        >
                                                            Grade
                                                        </Button>
                                                    ) : submission.status === 'graded' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setGradingSubmission(submission);
                                                                setGrade(submission.grade?.toString() || '');
                                                                setFeedback(submission.feedback || '');
                                                            }}
                                                            className="rounded-xl font-bold border-slate-200"
                                                        >
                                                            Edit
                                                        </Button>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm font-medium italic">Auto-graded</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grading Dialog */}
            <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                <DialogContent className="max-w-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">Grade Submission</DialogTitle>
                        <DialogDescription className="text-slate-600">
                            {gradingSubmission?.learnerId?.firstName} {gradingSubmission?.learnerId?.lastName} • {gradingSubmission?.lessonId?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Content</Label>
                            <p className="mt-3 text-sm text-slate-700 break-all leading-relaxed">{gradingSubmission?.content}</p>
                            <p className="text-xs text-slate-500 mt-3 font-medium">
                                Submitted on {gradingSubmission?.submittedAt && new Date(gradingSubmission.submittedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade" className="text-sm font-bold text-slate-700">
                                Grade (out of 10) <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="grade"
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="Enter grade (0-10)"
                                className="rounded-xl border-slate-200 h-11 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="feedback" className="text-sm font-bold text-slate-700">Feedback (Optional)</Label>
                            <Textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide constructive feedback to help the learner improve..."
                                rows={4}
                                className="rounded-xl border-slate-200 font-medium resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setGradingSubmission(null)}
                            disabled={isGrading}
                            className="rounded-xl font-bold border-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGrade}
                            disabled={isGrading}
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-sm"
                        >
                            {isGrading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Grading...
                                </>
                            ) : (
                                'Submit Grade'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
