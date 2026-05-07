'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort, DropRecommendation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  UserX, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Calendar, 
  TrendingUp,
  Search,
  Mail,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function CohortDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [cohort, setCohort] = useState<Cohort | null>(null);
    const [learners, setLearners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
                
                // Security Check: ONLY Admins and Super Admins are allowed to view cohort details.
                // Learners and Instructors are strictly blocked from this view.
                const isAdmin = user.role === 'admin' || user.role === 'super-admin';
                
                if (!isAdmin) {
                    toast.error('Access Denied: You do not have permission to view detailed cohort configurations.');
                    router.push('/dashboard/cohorts');
                    return;
                }

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
                status: 'pending'
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
        return (
          <div className="min-h-screen bg-slate-50/50">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
            <div className="max-w-7xl mx-auto p-8 space-y-8">
              <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-xl" />
              <div className="h-20 bg-white border border-slate-100 rounded-[32px] animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-[32px] animate-pulse" />)}
              </div>
            </div>
          </div>
        );
    }

    if (!cohort) return null;

    const filteredLearners = learners.filter(l => 
      `${l.firstName} ${l.lastName} ${l.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const authorizedEmails = cohort.allowedLearners || [];
    const filteredAuthorized = authorizedEmails.filter(email => 
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

            <div className="max-w-7xl mx-auto p-8 space-y-10">
                {/* Navigation & Actions */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    className="rounded-xl h-10 px-4 text-slate-500 hover:text-slate-900 transition-colors gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                  </Button>
                  
                  <div className="flex gap-3">
                    {user?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/admin/cohorts/${id}`)}
                        className="rounded-xl h-10 border-slate-200 text-slate-600 gap-2 hover:bg-slate-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Access
                      </Button>
                    )}
                  </div>
                </div>

                {/* Hero Header */}
                <div className="bg-white border border-slate-100 rounded-2xl p-10 lg:p-14 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100/50 transition-colors duration-500" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className={cn(
                                "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                                cohort.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                cohort.status === 'upcoming' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                "bg-slate-50 text-slate-700 border-slate-200"
                            )}>
                                {cohort.status === 'active' ? '● Ongoing Session' : cohort.status}
                            </Badge>
                            <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] font-bold border-slate-100 text-slate-400 bg-slate-50/50">
                                ID: {cohort._id?.toString().slice(-8).toUpperCase()}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">{cohort.name}</h1>
                            <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">
                                {cohort.description || "A comprehensive learning track designed for professional growth and skill mastery."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-8 flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enrolled Learners</p>
                            <p className="text-3xl font-semibold text-slate-900">{cohort.learnerIds?.length || 0}</p>
                          </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-8 flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pass Threshold</p>
                            <p className="text-3xl font-semibold text-slate-900">{cohort.performanceThreshold}%</p>
                          </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-8 flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Date</p>
                            <p className="text-xl font-semibold text-slate-900">{new Date(cohort.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Management Section */}
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                    <div className="space-y-8 pt-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                          <GraduationCap className="w-6 h-6 text-indigo-500" />
                          Cohort Management
                        </h2>
                        
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            placeholder="Filter records..."
                            className="h-10 pl-10 w-64 rounded-xl bg-white border-slate-200 focus:bg-white transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <Tabs defaultValue="learners" className="w-full">
                        <TabsList className="h-12 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 mb-8 inline-flex">
                          <TabsTrigger value="learners" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                            Active Learners
                          </TabsTrigger>
                          <TabsTrigger value="submissions" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                            Submissions
                          </TabsTrigger>
                          <TabsTrigger value="authorized" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold uppercase tracking-widest">
                            Authorized Network
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="learners" className="mt-0 focus-visible:outline-none">
                            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner Profile</TableHead>
                                            <TableHead className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Status</TableHead>
                                            <TableHead className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance</TableHead>
                                            <TableHead className="py-5 px-8 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLearners.map((learner) => (
                                            <TableRow key={learner._id} className="group hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-5 px-8">
                                                  <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-semibold border-2 border-white shadow-sm">
                                                      {learner.firstName[0]}{learner.lastName[0]}
                                                    </div>
                                                    <div>
                                                      <p className="font-semibold text-slate-900">{learner.firstName} {learner.lastName}</p>
                                                      <p className="text-xs text-slate-400">{learner.email}</p>
                                                    </div>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge className={cn(
                                                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-none border",
                                                      learner.progress?.status === 'on-track' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                      learner.progress?.status === 'under-review' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                      learner.progress?.status === 'dropped' ? "bg-slate-50 text-slate-500 border-slate-100" : 
                                                      "bg-blue-50 text-blue-700 border-blue-100"
                                                    )}>
                                                        {learner.progress?.status || 'Active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                  <div className="space-y-1.5 w-32">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                      <span>Current Score</span>
                                                      <span>{learner.progress?.currentScore ? Math.round(learner.progress.currentScore) : 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                      <div 
                                                        className={cn(
                                                          "h-full rounded-full transition-all duration-1000",
                                                          (learner.progress?.currentScore || 0) >= cohort.performanceThreshold ? "bg-emerald-500" : "bg-amber-500"
                                                        )}
                                                        style={{ width: `${Math.min(learner.progress?.currentScore || 0, 100)}%` }} 
                                                      />
                                                    </div>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="py-5 px-8 text-right">
                                                    {learner.progress?.status !== 'dropped' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedLearner(learner);
                                                                setIsKickoutOpen(true);
                                                            }}
                                                            className="rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredLearners.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-20 text-slate-400">
                                                    <div className="space-y-4">
                                                      <Users className="w-12 h-12 mx-auto opacity-20" />
                                                      <p className="text-sm font-medium">No records found matching your filter.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="submissions" className="mt-0 focus-visible:outline-none">
                            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="py-5 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitter</TableHead>
                                            <TableHead className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignment Unit</TableHead>
                                            <TableHead className="py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="py-5 px-8 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluation</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((sub) => (
                                            <TableRow key={sub._id} className="group hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-5 px-8">
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                      <Mail className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                      <p className="font-semibold text-slate-900">{sub.learnerId?.firstName} {sub.learnerId?.lastName}</p>
                                                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                    </div>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                  <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-indigo-400" />
                                                    <span className="font-medium text-slate-700">{sub.lessonId?.assignment?.title || sub.lessonId?.name}</span>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge className={cn(
                                                      "rounded-full px-3 py-1 text-[10px] font-bold border-none shadow-none",
                                                      sub.status === 'graded' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                                    )}>
                                                        {sub.status === 'graded' ? 'GRADED' : 'PENDING'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-5 px-8 text-right">
                                                    {sub.status === 'graded' ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <span className={cn(
                                                              "text-lg font-black tracking-tight",
                                                              sub.grade >= 7 ? 'text-emerald-600' : 'text-rose-600'
                                                            )}>
                                                                {sub.grade}<span className="text-[10px] text-slate-300 ml-0.5">/ 10</span>
                                                            </span>
                                                            <Button 
                                                              variant="ghost" 
                                                              size="sm" 
                                                              onClick={() => {
                                                                  setGradingSubmission(sub);
                                                                  setGrade(sub.grade.toString());
                                                                  setFeedback(sub.feedback || '');
                                                              }}
                                                              className="rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                            >
                                                              Edit
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                          size="sm" 
                                                          onClick={() => {
                                                              setGradingSubmission(sub);
                                                              setGrade('');
                                                              setFeedback('');
                                                          }}
                                                          className="rounded-xl h-8 px-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                                        >
                                                            Evaluate
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        <TabsContent value="authorized" className="mt-0 focus-visible:outline-none">
                            <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white min-h-[400px]">
                              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                    <ShieldCheck className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-slate-900">Authorized Learner Network</h3>
                                    <p className="text-xs text-slate-400">Restricted registration whitelist for this cohort.</p>
                                  </div>
                                </div>
                                
                                {user?.role === 'admin' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => router.push(`/admin/cohorts/${id}`)}
                                    className="rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200"
                                  >
                                    Manage List
                                  </Button>
                                )}
                              </div>

                              <div className="p-0">
                                {filteredAuthorized.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-slate-50">
                                    {filteredAuthorized.map((email, index) => (
                                      <div key={index} className="p-6 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400">
                                          <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 truncate">{email}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                      <Users className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                      <h4 className="font-semibold text-slate-900">No Restricted Access</h4>
                                      <p className="text-sm text-slate-400 max-w-xs mx-auto">This cohort is currently open to all registered learners on the platform.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                )}

                {/* Kickout Dialog */}
                <Dialog open={isKickoutOpen} onOpenChange={setIsKickoutOpen}>
                    <DialogContent className="rounded-2xl p-0 overflow-hidden border-none shadow-xl">
                        <div className="p-10 space-y-8">
                            <DialogHeader>
                                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                                  <AlertTriangle className="h-8 w-8" />
                                </div>
                                <DialogTitle className="text-2xl font-semibold text-slate-900">Recommend Learner Drop</DialogTitle>
                                <DialogDescription className="text-slate-500 text-lg">
                                    You are recommending to remove <strong>{selectedLearner?.firstName} {selectedLearner?.lastName}</strong>. This request will be submitted for admin review.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-xs font-black uppercase tracking-widest text-slate-400">Reason for Request</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="e.g., Consistent low performance, violation of conduct..."
                                        value={kickoutReason}
                                        onChange={(e) => setKickoutReason(e.target.value)}
                                        className="rounded-2xl border-slate-100 bg-slate-50 min-h-[100px] focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="evidence" className="text-xs font-black uppercase tracking-widest text-slate-400">Supporting Evidence (Optional)</Label>
                                    <Textarea
                                        id="evidence"
                                        placeholder="e.g., Failed 3 consecutive assignments..."
                                        value={kickoutEvidence}
                                        onChange={(e) => setKickoutEvidence(e.target.value)}
                                        className="rounded-2xl border-slate-100 bg-slate-50 min-h-[100px] focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-3">
                                <Button variant="ghost" onClick={() => setIsKickoutOpen(false)} className="rounded-2xl h-12 px-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                                <Button onClick={handleKickout} className="rounded-2xl h-12 px-8 bg-rose-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all">Submit Recommendation</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Grading Dialog */}
                <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                    <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border-none shadow-xl">
                        <div className="p-10 space-y-8">
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                                    <GraduationCap className="w-8 h-8" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-2xl font-semibold text-slate-900">Performance Evaluation</DialogTitle>
                                    <DialogDescription className="text-slate-400 font-medium">
                                        Assessing <strong>{gradingSubmission?.learnerId?.firstName}</strong> on <strong>{gradingSubmission?.lessonId?.assignment?.title || 'Assignment'}</strong>
                                    </DialogDescription>
                                  </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100/50 max-h-48 overflow-y-auto">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Submission Content</p>
                                    {gradingSubmission?.content?.startsWith('http') ? (
                                        <a href={gradingSubmission.content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group">
                                            <FileText className="w-4 h-4" />
                                            <span className="border-b border-indigo-200 group-hover:border-indigo-600 transition-all">View Submission Material</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{gradingSubmission?.content}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <Label htmlFor="grade" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score (Max 10)</Label>
                                      <Input
                                          id="grade"
                                          type="number"
                                          min="0"
                                          max="10"
                                          step="0.5"
                                          value={grade}
                                          onChange={(e) => setGrade(e.target.value)}
                                          placeholder="0.0"
                                          className="h-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-lg font-bold text-center"
                                      />
                                  </div>
                                  <div className="bg-indigo-50/30 rounded-2xl p-4 flex items-center gap-4 border border-indigo-100/50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                      <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</p>
                                      <p className="text-xs font-bold text-indigo-600">Standard Grading</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Feedback</Label>
                                    <Textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide constructive insights for the learner..."
                                        className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-3">
                                <Button variant="ghost" onClick={() => setGradingSubmission(null)} className="rounded-2xl h-12 px-8 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                                <Button onClick={handleGrade} className="rounded-2xl h-12 px-8 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all">Submit Evaluation</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}