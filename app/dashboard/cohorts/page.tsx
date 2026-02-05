'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function CohortsPage() {
  const { user, refreshUser } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCohorts = async () => {
      try {
        const data = await api.getCohorts();
        setCohorts(data);
      } catch (error) {
        console.error('Error loading cohorts:', error);
        toast.error('Failed to load cohorts');
      } finally {
        setIsLoading(false);
      }
    };

    loadCohorts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
        <div className="p-6 space-y-6">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCohorts = cohorts.filter(c => c.status === 'active').length;
  const totalLearners = cohorts.reduce((sum, c) => sum + c.learnerIds.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Cohorts</h1>
          <p className="text-muted-foreground mt-2">
            {cohorts.length} cohorts • {activeCohorts} active
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Total Cohorts"
            value={cohorts.length}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Cohorts"
            value={activeCohorts}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            icon={Users}
            label="Total Learners"
            value={totalLearners}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Cohorts Grid */}
        <div className="grid gap-6">
          {cohorts.map((cohort) => (
            <Card key={cohort._id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{cohort.name}</h3>
                      <Badge className={`${getStatusColor(cohort.status)} border`}>
                        {cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{cohort.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cohort Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Learners
                    </p>
                    <p className="text-lg font-semibold">{cohort.learnerIds.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Duration
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date(cohort.startDate).toLocaleDateString()} -{' '}
                      {new Date(cohort.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Performance Target
                    </p>
                    <p className="text-lg font-semibold">{cohort.performanceThreshold}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Weekly Target
                    </p>
                    <p className="text-lg font-semibold">{cohort.weeklyTarget}h</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {user?.role === 'learner' ? (
                    (user.activeCohortId ? user.activeCohortId === cohort._id : cohort.learnerIds.includes(user.id)) ? (
                      <Button disabled className="w-full bg-green-600 text-white opacity-90">
                        Current Cohort
                      </Button>
                    ) : (
                      <Button 
                        onClick={async () => {
                          if (confirm('Joining this cohort will reset your progress in other cohorts. Continue?')) {
                             try {
                                await api.joinCohort(cohort._id);
                                toast.success('Joined cohort successfully');
                                // Refresh cohorts
                                const updatedCohorts = await api.getCohorts();
                                setCohorts(updatedCohorts);
                                // Refresh user to update activeCohortId
                                await refreshUser();
                             } catch (error) {
                                console.error(error);
                                toast.error('Failed to join cohort');
                             }
                          }
                        }} 
                        className="w-full"
                        disabled={cohort.status !== 'upcoming' && cohort.status !== 'active'}
                      >
                        Join Cohort
                      </Button>
                    )
                  ) : (
                    <>
                      <Button className="flex-1 bg-primary hover:bg-primary/90">
                        View Learners
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Progress
                      </Button>
                      <Button variant="ghost" className="flex-1">
                        Settings
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {cohorts.length === 0 && (
          <Card className="border-border">
            <CardContent className="pt-6 text-center space-y-3">
              <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-muted-foreground">No cohorts assigned yet</p>
              <p className="text-xs text-muted-foreground">Contact admin to be assigned to a cohort</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
