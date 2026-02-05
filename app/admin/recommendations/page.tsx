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
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const pendingRecs = recommendations.filter((r) => r.status === 'pending');
  const pendingAppeals = appeals.filter((a) => a.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reviews & Appeals</h1>
        <p className="text-muted-foreground mt-2">Manage drop recommendations and learner appeals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {pendingRecs.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Appeals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingAppeals.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {recommendations.filter((r) => r.status !== 'pending').length +
                appeals.filter((a) => a.status !== 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recommendations ({pendingRecs.length})
          </TabsTrigger>
          <TabsTrigger value="appeals" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Appeals ({pendingAppeals.length})
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {pendingRecs.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">No pending recommendations</p>
              </CardContent>
            </Card>
          ) : (
            pendingRecs.map((rec) => (
              <Card key={rec._id} className="border-border/50 border-orange-200 dark:border-orange-900">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Drop Recommendation
                        <Badge className="ml-2 bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900">
                          Pending
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Submitted {new Date(rec.submittedAt).toLocaleDateString()} by Instructor ID:{' '}
                        {rec.instructorId}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Learner</p>
                      <p className="font-medium text-foreground">Learner ID: {rec.learnerId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cohort</p>
                      <p className="font-medium text-foreground">Cohort ID: {rec.cohortId}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Reason</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {rec.reason}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Evidence</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {rec.evidence}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleRecommendation(rec, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRecommendation(rec, 'rejected')}
                      variant="outline"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Appeals Tab */}
        <TabsContent value="appeals" className="space-y-4">
          {pendingAppeals.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground">No pending appeals</p>
              </CardContent>
            </Card>
          ) : (
            pendingAppeals.map((appeal) => (
              <Card
                key={appeal._id}
                className="border-border/50 border-yellow-200 dark:border-yellow-900"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Learner Appeal
                        <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900">
                          Pending
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Submitted {new Date(appeal.submittedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Learner</p>
                      <p className="font-medium text-foreground">Learner ID: {appeal.learnerId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cohort</p>
                      <p className="font-medium text-foreground">Cohort ID: {appeal.cohortId}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Appeal Reason</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {appeal.reason}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleAppeal(appeal, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Approve Appeal
                    </Button>
                    <Button
                      onClick={() => handleAppeal(appeal, 'rejected')}
                      variant="outline"
                      className="flex-1"
                    >
                      Reject Appeal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Recommendation Decision Dialog */}
      <AlertDialog open={showRecDialog} onOpenChange={setShowRecDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isApproving ? 'Approve' : 'Reject'} Drop Recommendation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Add your review notes before finalizing this decision
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            placeholder="Enter your review notes..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="min-h-32"
          />

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitRecommendationDecision}
              className={isApproving ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isApproving ? 'Approve Recommendation' : 'Reject Recommendation'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appeal Decision Dialog */}
      <AlertDialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isApproving ? 'Approve' : 'Reject'} Appeal
            </AlertDialogTitle>
            <AlertDialogDescription>
              Add your review notes before finalizing this decision
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            placeholder="Enter your review notes..."
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="min-h-32"
          />

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitAppealDecision}
              className={isApproving ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isApproving ? 'Approve Appeal' : 'Reject Appeal'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
