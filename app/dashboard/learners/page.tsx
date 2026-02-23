'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, AlertCircle, MessageSquare, Flag, UserCheck, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped';
  currentScore: number;
  inactivityDays: number;
  cohortId?: string;
}

function LearnerSkeleton() {
  return (
    <Card className="border-border animate-pulse">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 w-full md:w-auto">
            <div className="space-y-2">
              <div className="h-3 w-12 bg-muted rounded mx-auto" />
              <div className="h-6 w-16 bg-muted rounded mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-12 bg-muted rounded mx-auto" />
              <div className="h-6 w-16 bg-muted rounded mx-auto" />
            </div>
            <div className="h-10 w-24 bg-muted rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LearnersPage() {
  const { user } = useAuth();
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showRecommendDialog, setShowRecommendDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [recommendReason, setRecommendReason] = useState('');
  const [recommendEvidence, setRecommendEvidence] = useState('');

  const fetchLearners = async () => {
    try {
      setIsLoading(true);
      const data = await api.getInstructorLearners();
      setLearners(data);
    } catch (error) {
      console.error('Failed to fetch learners:', error);
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super-admin') {
      fetchLearners();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'at-risk':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'dropped':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredLearners = learners.filter(
    (learner) => {
      const matchesSearch =
        learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = activeTab === 'all' || learner.status === activeTab;

      return matchesSearch && matchesTab;
    }
  );

  const handleAddNote = async () => {
    if (!selectedLearner || !noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      if (!selectedLearner.cohortId) {
        toast.error('Learner is not associated with a cohort');
        return;
      }

      await api.submitInstructorNote({
        learnerId: selectedLearner.id,
        cohortId: selectedLearner.cohortId,
        note: noteText,
        type: 'general',
      });

      toast.success('Note added successfully');
      setShowNoteDialog(false);
      setNoteText('');
      setSelectedLearner(null);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleRecommendDrop = async () => {
    if (!selectedLearner || !recommendReason.trim() || !recommendEvidence.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (!selectedLearner.cohortId) {
        toast.error('Learner is not associated with a cohort');
        return;
      }

      await api.submitDropRecommendation({
        learnerId: selectedLearner.id,
        cohortId: selectedLearner.cohortId,
        reason: recommendReason,
        evidence: recommendEvidence,
      });

      toast.success('Recommendation submitted for review');
      setShowRecommendDialog(false);
      setRecommendReason('');
      setRecommendEvidence('');
      setSelectedLearner(null);
      fetchLearners(); // Refresh list to show updated status if immediate
    } catch (error) {
      toast.error('Failed to submit recommendation');
    }
  };

  const onTrackCount = learners.filter(l => l.status === 'on-track').length;
  const atRiskCount = learners.filter(l => l.status === 'at-risk').length;
  const underReviewCount = learners.filter(l => l.status === 'under-review').length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-4xl font-bold text-slate-900 tracking-tight">Learner Management</h1>
            <p className="text-slate-500 mt-2 font-medium">Monitoring {learners.length} active learners across your cohorts</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Learners"
            value={learners.length}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
          />
          <StatCard
            icon={UserCheck}
            label="On Track"
            value={onTrackCount}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            icon={AlertCircle}
            label="At Risk"
            value={atRiskCount}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
          <StatCard
            icon={Flag}
            label="Under Review"
            value={underReviewCount}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
          />
        </div>

        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                  <TabsTrigger value="all" className="rounded-lg px-4 font-semibold">All</TabsTrigger>
                  <TabsTrigger value="on-track" className="rounded-lg px-4 font-semibold">On Track</TabsTrigger>
                  <TabsTrigger value="at-risk" className="rounded-lg px-4 font-semibold">At Risk</TabsTrigger>
                  <TabsTrigger value="under-review" className="rounded-lg px-4 font-semibold">Under Review</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-full lg:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => <LearnerSkeleton key={i} />)}
              </div>
            ) : filteredLearners.length > 0 ? (
              <div className="space-y-4">
                {filteredLearners.map((learner) => (
                  <Card key={learner.id} className="group border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 rounded-[24px] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="w-14 h-14 border-2 border-slate-50 ring-4 ring-slate-50/50 shadow-sm">
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-lg">
                              {learner.firstName[0]}{learner.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-800">
                                {learner.firstName} {learner.lastName}
                              </h3>
                              <Badge className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border-none shadow-sm",
                                learner.status === 'on-track' ? "bg-emerald-100 text-emerald-700" :
                                  learner.status === 'at-risk' ? "bg-orange-100 text-orange-700" :
                                    learner.status === 'under-review' ? "bg-amber-100 text-amber-700" :
                                      "bg-rose-100 text-rose-700"
                              )}>
                                {learner.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">{learner.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-8 lg:gap-12 min-w-full lg:min-w-0">
                          <div className="space-y-2 lg:w-32">
                            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Score</span>
                              <span className="text-slate-900">{learner.currentScore}%</span>
                            </div>
                            <Progress
                              value={learner.currentScore}
                              className="h-1.5 bg-slate-100"
                              indicatorClassName={cn(
                                learner.currentScore >= 75 ? "bg-emerald-500" :
                                  learner.currentScore >= 60 ? "bg-orange-500" :
                                    "bg-rose-500"
                              )}
                            />
                          </div>

                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Inactivity</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <span className={cn(
                                "text-xl font-bold",
                                learner.inactivityDays > 7 ? "text-rose-600" :
                                  learner.inactivityDays > 3 ? "text-orange-600" :
                                    "text-slate-800"
                              )}>
                                {learner.inactivityDays}
                              </span>
                              <span className="text-xs font-bold text-slate-400">days</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 col-span-2 sm:col-span-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedLearner(learner);
                                setShowNoteDialog(true);
                              }}
                              className="w-10 h-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                              title="Add Note"
                            >
                              <MessageSquare className="w-5 h-5" />
                            </Button>
                            {(learner.status === 'at-risk' || learner.status === 'under-review') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedLearner(learner);
                                  setShowRecommendDialog(true);
                                }}
                                className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Recommend for Drop"
                              >
                                <Flag className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No learners found</h3>
                <p className="text-slate-500 max-w-sm font-medium">
                  We couldn't find any learners matching your current search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Note Dialog */}
        <AlertDialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8 max-w-lg">
            <AlertDialogHeader className="mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">Add Instructional Note</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Add a private note for <span className="text-slate-900 font-bold">{selectedLearner?.firstName} {selectedLearner?.lastName}</span>.
                This will be used for internal evaluation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="e.g., Working on module 3, showing improvement in logical reasoning..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-32 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium py-4 px-5"
            />
            <div className="flex gap-3 justify-end mt-8">
              <AlertDialogCancel className="rounded-xl font-bold h-12 px-6 border-slate-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAddNote}
                className="rounded-xl font-bold h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
              >
                Add Note
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Drop Recommendation Dialog */}
        <AlertDialog open={showRecommendDialog} onOpenChange={setShowRecommendDialog}>
          <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8 max-w-md">
            <AlertDialogHeader className="mb-6">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
                <Flag className="w-7 h-7" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">Recommend for Drop</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Recommend <span className="text-slate-900 font-bold">{selectedLearner?.firstName} {selectedLearner?.lastName}</span> for potential drop due to lack of progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Reason</label>
                <Input
                  placeholder="e.g., Consistent low performance"
                  value={recommendReason}
                  onChange={(e) => setRecommendReason(e.target.value)}
                  className="bg-slate-50 border-slate-100 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/10 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Evidence</label>
                <Textarea
                  placeholder="Provide supporting evidence for this recommendation..."
                  value={recommendEvidence}
                  onChange={(e) => setRecommendEvidence(e.target.value)}
                  className="min-h-24 bg-slate-50 border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10 font-medium py-3 px-4"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <AlertDialogCancel className="rounded-xl font-bold h-12 px-6 border-slate-200">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRecommendDrop}
                className="rounded-xl font-bold h-12 px-8 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
              >
                Submit Recommendation
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
