'use client';

import { useEffect, useState } from 'react';
import { api, DropRecommendation, Appeal } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  User,
  Layers,
  Calendar,
  ArrowRight,
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<DropRecommendation[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<DropRecommendation | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showRecDialog, setShowRecDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recsData, appealsData] = await Promise.all([
          api.getDropRecommendations(),
          api.getAppeals(),
        ]);
        setRecommendations(recsData);
        setAppeals(appealsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRecommendation = async (rec: DropRecommendation, status: 'approved' | 'rejected') => {
    setSelectedRec(rec);
    setIsApproving(status === 'approved');
    setShowRecDialog(true);
  };

  const submitRecommendationDecision = async () => {
    if (!selectedRec) return;

    try {
      await api.updateDropRecommendation(selectedRec._id, {
        status: isApproving ? 'approved' : 'rejected',
        reviewNotes,
      });

      setRecommendations(recommendations.filter((r) => r._id !== selectedRec._id));
      toast.success(`Recommendation ${isApproving ? 'approved' : 'rejected'}`);
      setShowRecDialog(false);
      setReviewNotes('');
      setSelectedRec(null);
    } catch (error) {
      toast.error('Failed to process recommendation');
    }
  };

  const handleAppeal = async (appeal: Appeal, status: 'approved' | 'rejected') => {
    setSelectedAppeal(appeal);
    setIsApproving(status === 'approved');
    setShowAppealDialog(true);
  };

  const submitAppealDecision = async () => {
    if (!selectedAppeal) return;

    try {
      await api.updateAppeal(selectedAppeal._id, {
        status: isApproving ? 'approved' : 'rejected',
        reviewNotes,
      });

      setAppeals(appeals.filter((a) => a._id !== selectedAppeal._id));
      toast.success(`Appeal ${isApproving ? 'approved' : 'rejected'}`);
      setShowAppealDialog(false);
      setReviewNotes('');
      setSelectedAppeal(null);
    } catch (error) {
      toast.error('Failed to process appeal');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 animate-pulse rounded-lg w-64" />
          <div className="h-4 bg-slate-100 animate-pulse rounded w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[24px]" />
          ))}
        </div>
        <div className="h-[500px] bg-slate-50 animate-pulse rounded-[32px] border border-slate-100" />
      </div>
    );
  }

  const pendingRecs = recommendations.filter((r) => r.status === 'pending');
  const pendingAppeals = appeals.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">Approval Logic</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Governance & Review</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Moderate drop recommendations from instructors and process student lifecycle appeals.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={AlertCircle}
          label="Pending Drop Actions"
          value={pendingRecs.length}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
        />
        <StatCard
          icon={Shield}
          label="Active Appeals"
          value={pendingAppeals.length}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Cycle Completion"
          value={recommendations.filter((r) => r.status !== 'pending').length + appeals.filter((a) => a.status !== 'pending').length}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
        <Tabs defaultValue="recommendations" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-slate-100/50 p-1 h-auto rounded-xl inline-flex w-fit">
              <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-semibold uppercase tracking-wider">
                Recommendations ({pendingRecs.length})
              </TabsTrigger>
              <TabsTrigger value="appeals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-xs font-semibold uppercase tracking-wider">
                Appeals ({pendingAppeals.length})
              </TabsTrigger>
            </TabsList>

            <Badge variant="outline" className="text-[10px] font-semibold text-slate-400 border-slate-100 px-3 h-8 rounded-full flex items-center gap-2">
              <Clock className="w-3 h-3" /> Average response: 4h 12m
            </Badge>
          </div>

          <TabsContent value="recommendations" className="space-y-6">
            {pendingRecs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">Clear Horizon</p>
                  <p className="text-sm text-slate-400">No instructors have submitted drop recommendations yet.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingRecs.map((rec) => (
                  <Card key={rec._id} className="group border-slate-100 shadow-none hover:shadow-lg hover:border-orange-200 transition-all duration-300 rounded-[24px] overflow-hidden">
                    <div className="bg-orange-50/30 p-4 border-b border-orange-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-600">Action Required: Recommendation</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">ID: {rec._id?.toString().slice(-6)}</span>
                    </div>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Student Reference</p>
                              <p className="text-sm font-semibold text-slate-700">Learner ID: #{rec.learnerId?.toString().slice(-4)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Assigned Cohort</p>
                              <p className="text-sm font-semibold text-slate-700">Cohort ID: #{rec.cohortId?.toString().slice(-4)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 space-y-4 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                          <div>
                            <h4 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2 mb-2">
                              <MessageSquare className="w-3 h-3" /> Instructor Justification
                            </h4>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{rec.reason}"</p>
                          </div>
                          <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2 mb-2">
                              <FileText className="w-3 h-3" /> Supporting Evidence
                            </h4>
                            <p className="text-sm text-slate-600 font-medium">{rec.evidence}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span className="text-[11px] font-semibold text-slate-400">Submitted {new Date(rec.submittedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => handleRecommendation(rec, 'rejected')} variant="outline" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-semibold text-rose-500 hover:bg-rose-50 hover:border-rose-100">
                            <ThumbsDown className="w-3 h-3 mr-2" /> Reject Drop
                          </Button>
                          <Button onClick={() => handleRecommendation(rec, 'approved')} className="rounded-xl h-10 px-8 bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all font-semibold text-xs">
                            <ThumbsUp className="w-3 h-3 mr-2" /> Approve Recommendation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appeals" className="space-y-6">
            {pendingAppeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">Peaceful Environment</p>
                  <p className="text-sm text-slate-400">No learner appeals are currently awaiting resolution.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingAppeals.map((appeal) => (
                  <Card key={appeal._id} className="group border-slate-100 shadow-none hover:shadow-lg hover:border-indigo-200 transition-all duration-300 rounded-[24px] overflow-hidden">
                    <div className="bg-indigo-50/30 p-4 border-b border-indigo-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">Form Submission: Lifestyle Appeal</span>
                      </div>
                      <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[9px] font-semibold uppercase tracking-tight">Active Mediation</Badge>
                    </div>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Contributor</p>
                              <p className="text-sm font-semibold text-slate-700">Learner ID: #{appeal.learnerId?.toString().slice(-4)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">Academic Group</p>
                              <p className="text-sm font-semibold text-slate-700">Cohort ID: #{appeal.cohortId?.toString().slice(-4)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                          <h4 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2 mb-3">
                            <Info className="w-3 h-3" /> Learner's Statement
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white/80 p-4 rounded-xl border border-slate-50 shadow-sm">
                            {appeal.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          <span className="text-[11px] font-semibold text-slate-400">Submitted {new Date(appeal.submittedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => handleAppeal(appeal, 'rejected')} variant="outline" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-semibold hover:bg-slate-50">
                            Dismiss Appeal
                          </Button>
                          <Button onClick={() => handleAppeal(appeal, 'approved')} className="rounded-xl h-10 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all font-semibold text-xs text-white">
                            Grant Reinstatement
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommendation Decision Dialog */}
      <AlertDialog open={showRecDialog} onOpenChange={setShowRecDialog}>
        <AlertDialogContent className="max-w-xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className={cn("p-8 text-white", isApproving ? "bg-emerald-600" : "bg-rose-600")}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                {isApproving ? 'Confirm Approval' : 'Review Rejection'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80 text-sm">
                Provide notes to the instructor regarding this decision.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <Textarea
              placeholder="Enter your administrative review notes..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="min-h-32 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all resize-none p-4"
            />

            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="rounded-xl h-12 border-slate-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={submitRecommendationDecision}
                className={cn(
                  "rounded-xl h-12 px-8 font-semibold shadow-lg transition-all hover:-translate-y-0.5",
                  isApproving ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                )}
              >
                {isApproving ? 'Submit Approval' : 'Finalize Rejection'}
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appeal Decision Dialog */}
      <AlertDialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <AlertDialogContent className="max-w-xl rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className={cn("p-8 text-white", isApproving ? "bg-indigo-600" : "bg-slate-900")}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-semibold">
                {isApproving ? 'Grant Appeal' : 'Deny Appeal'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80 text-sm opacity-90">
                Define the final outcome of this learner appeal.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <Textarea
              placeholder="Provide final verdict and feedback for the learner..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="min-h-32 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all resize-none p-4"
            />

            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="rounded-xl h-12">Return</AlertDialogCancel>
              <AlertDialogAction
                onClick={submitAppealDecision}
                className={cn(
                  "rounded-xl h-12 px-8 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5",
                  isApproving ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                )}
              >
                {isApproving ? 'Grant Reinstatement' : 'Deny & Finalize Drop'}
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
