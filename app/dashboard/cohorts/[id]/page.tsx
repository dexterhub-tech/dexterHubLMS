'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort, DropRecommendation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, UserX, AlertTriangle, CheckCircle, FileText, Clock, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function CohortDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [learners, setLearners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Kickout Dialog State
    const [isKickoutOpen, setIsKickoutOpen] = useState(false);
    const [selectedLearner, setSelectedLearner] = useState<any>(null);
    const [kickoutReason, setKickoutReason] = useState('');
    const [kickoutEvidence, setKickoutEvidence] = useState('');

    // Grading State
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [gradingSubmission, setGradingSubmission] = useState<any>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;

            try {
                setIsLoading(true);
                const cohortData = await api.getCohort(id);
                setCohort(cohortData);

                if (user.role === 'instructor' || user.role === 'admin') {
                    const [learnersData, submissionsData] = await Promise.all([
                        api.getCohortLearners(id),
                        api.getSubmissions(id)
                    ]);
                    setLearners(learnersData);
                    setSubmissions(submissionsData);
                }
            } catch (error) {
                console.error('Failed to fetch cohort details:', error);
                toast.error('Failed to load cohort details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const handleKickout = async () => {
        if (!selectedLearner || !kickoutReason) {
            toast.error('Please provide a reason');
            return;
        }

        try {
            await api.submitDropRecommendation({
                learnerId: selectedLearner._id,
                cohortId: id,
                reason: kickoutReason,
                evidence: kickoutEvidence,
                status: 'pending' // Instructors usually recommend, Admins approve. Or auto-approve if logic allows.
            });

            toast.success(`Drop recommendation submitted for ${selectedLearner.firstName}`);
            setIsKickoutOpen(false);
            setKickoutReason('');
            setKickoutEvidence('');
            setSelectedLearner(null);
        } catch (error) {
            console.error('Failed to submit drop recommendation:', error);
            toast.error('Failed to submit request');
        }
    };

    const handleGrade = async () => {
        if (!gradingSubmission || !grade) return;

        const numericGrade = parseFloat(grade);
        if (numericGrade > 10) {
            toast.error('Maximum grade is 10 points');
            return;
        }

        try {
            await api.gradeSubmission({
                submissionId: gradingSubmission._id,
                grade: numericGrade,
                feedback: feedback
            });

            toast.success('Submission graded successfully');
            setGradingSubmission(null);
            setGrade('');
            setFeedback('');

            // Refresh data
            const [submissionsData, learnersData] = await Promise.all([
                api.getSubmissions(id),
                api.getCohortLearners(id)
            ]);
            setSubmissions(submissionsData);
            setLearners(learnersData);
        } catch (error: any) {
            toast.error(error.message || 'Failed to grade submission');
        }
    };

    if (isLoading) {
        return <div className="p-10 text-center">Loading cohort details...</div>;
    }

    if (!cohort) {
        return <div className="p-10 text-center">Cohort not found</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">{cohort.name}</h1>
                        <p className="text-muted-foreground mt-1">{cohort.description}</p>
                    </div>
                    <Badge variant={cohort.status === 'active' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                        {cohort.status.toUpperCase()}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Start Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {new Date(cohort.startDate).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">End Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {new Date(cohort.endDate).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Learners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {cohort.learnerIds?.length || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructor View: Learner Management & Submissions */}
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                    <Tabs defaultValue="learners" className="mt-8">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="learners">Learners</TabsTrigger>
                            <TabsTrigger value="submissions">Submissions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="learners">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Learner Performance & Management</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {learners.map((learner) => (
                                                <TableRow key={learner._id}>
                                                    <TableCell className="font-medium">{learner.firstName} {learner.lastName}</TableCell>
                                                    <TableCell>{learner.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={
                                                            learner.progress?.status === 'on-track' ? 'default' :
                                                                learner.progress?.status === 'under-review' ? 'destructive' :
                                                                    learner.progress?.status === 'dropped' ? 'secondary' : 'outline'
                                                        }>
                                                            {learner.progress?.status || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{learner.progress?.currentScore ? `${Math.round(learner.progress.currentScore)}%` : 'N/A'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {learner.progress?.status !== 'dropped' && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedLearner(learner);
                                                                    setIsKickoutOpen(true);
                                                                }}
                                                            >
                                                                <UserX className="w-4 h-4 mr-2" />
                                                                Drop
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {learners.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No learners enrolled yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="submissions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assignment Submissions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Learner</TableHead>
                                                <TableHead>Assignment</TableHead>
                                                <TableHead>Submission Status</TableHead>
                                                <TableHead>Submitted At</TableHead>
                                                <TableHead className="text-right">Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.map((sub) => (
                                                <TableRow key={sub._id}>
                                                    <TableCell className="font-medium">
                                                        {sub.learnerId?.firstName} {sub.learnerId?.lastName}
                                                        <div className="text-xs text-muted-foreground">{sub.learnerId?.email}</div>
                                                    </TableCell>
                                                    <TableCell>{sub.lessonId?.assignment?.title || sub.lessonId?.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={sub.status === 'graded' ? 'default' : 'secondary'}>
                                                            {sub.status.toUpperCase()}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        {sub.status === 'graded' ? (
                                                            <div className="flex items-center justify-end gap-2 font-bold">
                                                                <span className={sub.grade >= 5 ? 'text-emerald-600' : 'text-rose-600'}>
                                                                    {sub.grade}/10
                                                                </span>
                                                                <Button variant="ghost" size="sm" onClick={() => {
                                                                    setGradingSubmission(sub);
                                                                    setGrade(sub.grade.toString());
                                                                    setFeedback(sub.feedback || '');
                                                                }}>
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => {
                                                                setGradingSubmission(sub);
                                                                setGrade('');
                                                                setFeedback('');
                                                            }}>
                                                                Grade
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {submissions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No submissions found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}

                {/* Kickout Dialog */}
                <Dialog open={isKickoutOpen} onOpenChange={setIsKickoutOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Recommend to Drop Learner
                            </DialogTitle>
                            <DialogDescription>
                                You are recommending to drop <strong>{selectedLearner?.firstName} {selectedLearner?.lastName}</strong> from this cohort.
                                This action will be reviewed by an admin.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Drop</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="e.g., Consistent low performance, violation of conduct..."
                                    value={kickoutReason}
                                    onChange={(e) => setKickoutReason(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evidence">Evidence / Notes (Optional)</Label>
                                <Textarea
                                    id="evidence"
                                    placeholder="e.g., Failed 3 consecutive assignments..."
                                    value={kickoutEvidence}
                                    onChange={(e) => setKickoutEvidence(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsKickoutOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleKickout}>Submit Recommendation</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Grading Dialog */}
                <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Grade Submission</DialogTitle>
                            <DialogDescription>
                                Grading for <strong>{gradingSubmission?.learnerId?.firstName} {gradingSubmission?.learnerId?.lastName}</strong> on assignment <strong>{gradingSubmission?.lessonId?.assignment?.title}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-100 max-h-40 overflow-y-auto">
                                <Label className="text-xs text-muted-foreground mb-1 block">Submission Content</Label>
                                {gradingSubmission?.content?.startsWith('http') ? (
                                    <a href={gradingSubmission.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                        {gradingSubmission.content}
                                    </a>
                                ) : (
                                    <p className="whitespace-pre-wrap text-slate-700">{gradingSubmission?.content}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Score (Max 10)</Label>
                                <Input
                                    id="grade"
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    placeholder="Enter score out of 10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide feedback..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                            <Button onClick={handleGrade}>Submit Grade</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}