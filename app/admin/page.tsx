'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, Cohort, DropRecommendation, Appeal } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle2,
  Users,
  BookOpen,
  FileText,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [recommendations, setRecommendations] = useState<DropRecommendation[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cohortsData, recsData, appealsData] = await Promise.all([
          api.getCohorts(),
          api.getDropRecommendations(),
          api.getAppeals(),
        ]);

        setCohorts(cohortsData);
        setRecommendations(recsData);
        setAppeals(appealsData);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRecommendation = async (
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      await api.updateDropRecommendation(id, {
        status,
        reviewNotes: notes || '',
      });

      setRecommendations(recommendations.filter((r) => r._id !== id));
      toast.success(`Recommendation ${status}`);
    } catch (error) {
      toast.error('Failed to update recommendation');
    }
  };

  const handleAppeal = async (
    id: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      await api.updateAppeal(id, {
        status,
        reviewNotes: notes || '',
      });

      setAppeals(appeals.filter((a) => a._id !== id));
      toast.success(`Appeal ${status}`);
    } catch (error) {
      toast.error('Failed to update appeal');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
        <div className="p-6 space-y-6">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCohorts = cohorts.filter((c) => c.status === 'active').length;
  const totalLearners = cohorts.reduce((sum, c) => sum + c.learnerIds.length, 0);
  const pendingRecommendations = recommendations.filter((r) => r.status === 'pending').length;
  const pendingAppeals = appeals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage cohorts, learners, and approvals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Active Cohorts"
            value={activeCohorts}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            icon={Users}
            label="Total Learners"
            value={totalLearners}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Reviews"
            value={pendingRecommendations}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            icon={Shield}
            label="Pending Appeals"
            value={pendingAppeals}
            iconColor="text-yellow-600"
            iconBgColor="bg-yellow-100"
          />
        </div>

        {/* Tabs for Recommendations and Appeals */}
        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recommendations">
              Recommendations ({pendingRecommendations})
            </TabsTrigger>
            <TabsTrigger value="appeals">
              Appeals ({pendingAppeals})
            </TabsTrigger>
          </TabsList>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length === 0 ? (
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending recommendations</p>
                </CardContent>
              </Card>
            ) : (
              recommendations.map((rec) => (
                <Card key={rec._id} className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Drop Recommendation{' '}
                          <Badge className="ml-2 bg-orange-100 text-orange-700 border-orange-200">
                            Pending
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Submitted on {new Date(rec.submittedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="text-sm font-medium mt-1">{rec.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Evidence</p>
                        <p className="text-sm font-medium mt-1">{rec.evidence}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleRecommendation(rec._id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRecommendation(rec._id, 'rejected')}
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

          {/* Appeals */}
          <TabsContent value="appeals" className="space-y-4">
            {appeals.length === 0 ? (
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No pending appeals</p>
                </CardContent>
              </Card>
            ) : (
              appeals.map((appeal) => (
                <Card key={appeal._id} className="border-border hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Appeal{' '}
                          <Badge className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-200">
                            Pending
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Submitted on {new Date(appeal.submittedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Reason</p>
                      <p className="text-sm font-medium mt-1">{appeal.reason}</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleAppeal(appeal._id, 'approved')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAppeal(appeal._id, 'rejected')}
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
        </Tabs>

        {/* Cohorts Overview */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Cohorts Overview</CardTitle>
            </div>
            <CardDescription>Active and upcoming cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            {cohorts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No cohorts found</p>
            ) : (
              <div className="space-y-3">
                {cohorts.slice(0, 5).map((cohort) => (
                  <div
                    key={cohort._id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{cohort.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cohort.learnerIds.length} learners •{' '}
                        {cohort.instructorIds.length} instructors
                      </p>
                    </div>
                    <Badge
                      className={
                        cohort.status === 'active'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    >
                      {cohort.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
