'use client';

import { useState } from 'react';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
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
import { Users, AlertCircle, MessageSquare, Flag, UserCheck } from 'lucide-react';
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
}

export default function LearnersPage() {
  const { user } = useAuth();
  const [learners] = useState<Learner[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      status: 'on-track',
      currentScore: 85,
      inactivityDays: 0,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      status: 'at-risk',
      currentScore: 62,
      inactivityDays: 5,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      status: 'on-track',
      currentScore: 78,
      inactivityDays: 1,
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah@example.com',
      status: 'under-review',
      currentScore: 55,
      inactivityDays: 14,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showRecommendDialog, setShowRecommendDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [recommendReason, setRecommendReason] = useState('');
  const [recommendEvidence, setRecommendEvidence] = useState('');

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
    (learner) =>
      learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNote = async () => {
    if (!selectedLearner || !noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await api.submitInstructorNote({
        learnerId: selectedLearner.id,
        cohortId: 'cohort-id',
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
      await api.submitDropRecommendation({
        learnerId: selectedLearner.id,
        cohortId: 'cohort-id',
        reason: recommendReason,
        evidence: recommendEvidence,
      });

      toast.success('Recommendation submitted for review');
      setShowRecommendDialog(false);
      setRecommendReason('');
      setRecommendEvidence('');
      setSelectedLearner(null);
    } catch (error) {
      toast.error('Failed to submit recommendation');
    }
  };

  const onTrackCount = learners.filter(l => l.status === 'on-track').length;
  const atRiskCount = learners.filter(l => l.status === 'at-risk').length;
  const underReviewCount = learners.filter(l => l.status === 'under-review').length;

  return (
    <div className="min-h-screen bg-background">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Learner Management</h1>
          <p className="text-muted-foreground mt-2">{filteredLearners.length} learners</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Learners"
            value={learners.length}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            icon={UserCheck}
            label="On Track"
            value={onTrackCount}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            icon={AlertCircle}
            label="At Risk"
            value={atRiskCount}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            icon={Flag}
            label="Under Review"
            value={underReviewCount}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Search */}
        <div>
          <Input
            placeholder="Search learners by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Learners List */}
        <div className="space-y-3">
          {filteredLearners.map((learner) => (
            <Card key={learner.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {learner.firstName} {learner.lastName}
                      </h3>
                      <Badge className={`${getStatusColor(learner.status)} border`}>
                        {learner.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{learner.email}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="text-2xl font-semibold text-foreground">{learner.currentScore}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-semibold text-foreground">{learner.inactivityDays}d</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {learner.status === 'at-risk' || learner.status === 'under-review' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLearner(learner);
                              setShowNoteDialog(true);
                            }}
                            className="gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Note
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedLearner(learner);
                              setShowRecommendDialog(true);
                            }}
                            className="gap-1"
                          >
                            <Flag className="w-3 h-3" />
                            Recommend
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLearner(learner);
                            setShowNoteDialog(true);
                          }}
                          className="gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Note
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredLearners.length === 0 && (
          <Card className="border-border">
            <CardContent className="pt-6 text-center space-y-3">
              <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No learners found</p>
            </CardContent>
          </Card>
        )}

        {/* Add Note Dialog */}
        <AlertDialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Instructional Note</AlertDialogTitle>
              <AlertDialogDescription>
                Add a note for {selectedLearner?.firstName} {selectedLearner?.lastName}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Enter your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-32"
            />
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAddNote}
                className="bg-primary hover:bg-primary/90"
              >
                Add Note
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Drop Recommendation Dialog */}
        <AlertDialog open={showRecommendDialog} onOpenChange={setShowRecommendDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Recommend for Drop
              </AlertDialogTitle>
              <AlertDialogDescription>
                Recommend {selectedLearner?.firstName} {selectedLearner?.lastName} for potential drop
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Input
                  placeholder="e.g., Consistent low performance"
                  value={recommendReason}
                  onChange={(e) => setRecommendReason(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Evidence</label>
                <Textarea
                  placeholder="Provide supporting evidence for this recommendation..."
                  value={recommendEvidence}
                  onChange={(e) => setRecommendEvidence(e.target.value)}
                  className="min-h-24"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRecommendDrop}
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Recommendation
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
