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
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
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
      <div className="min-h-screen bg-neutral-50/50">
        <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-[24px]" />
            ))}
          </div>
          <div className="h-96 bg-slate-100 animate-pulse rounded-[32px]" />
        </div>
      </div>
    );
  }

  const activeCohorts = cohorts.filter((c) => c.status === 'active').length;
  const totalLearners = cohorts.reduce((sum, c) => sum + c.learnerIds.length, 0);
  const pendingRecommendations = recommendations.filter((r) => r.status === 'pending').length;
  const pendingAppeals = appeals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-8 space-y-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-[10px] font-semibold tracking-tight uppercase">Admin Console</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Platform Overview</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-lg">
              Monitor systems, manage student lifecycles, and handle administrative requests.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/admin/cohorts')} variant="outline" className="rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all">
              Manage Cohorts
            </Button>
            <Button onClick={() => router.push('/admin/learners')} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Users Directory
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            label="Active Cohorts"
            value={activeCohorts}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            trend={{ value: '12% inc', isPositive: true }}
          />
          <StatCard
            icon={Users}
            label="Total Learners"
            value={totalLearners}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            trend={{ value: '2.4k new', isPositive: true }}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Reviews"
            value={pendingRecommendations}
            iconColor="text-rose-600"
            iconBgColor="bg-rose-50"
          />
          <StatCard
            icon={Shield}
            label="Open Appeals"
            value={pendingAppeals}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Action Area (Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Administrative Queue</h3>
                  <p className="text-slate-500 text-sm mt-1">Actions requiring your immediate attention</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 px-2 py-0.5 border-transparent bg-transparent hover:bg-transparent capitalize">Updated: Just now</Badge>
                </div>
              </div>

              <Tabs defaultValue="recommendations" className="space-y-6 flex-1 flex flex-col">
                <TabsList className="bg-slate-100/50 p-1 h-auto rounded-xl inline-flex w-fit mb-4">
                  <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-sm">
                    Recommendations
                    {pendingRecommendations > 0 && (
                      <span className="ml-2 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center animate-pulse">
                        {pendingRecommendations}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="appeals" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 text-sm">
                    Appeals
                    {pendingAppeals > 0 && (
                      <span className="ml-2 w-5 h-5 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center">
                        {pendingAppeals}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-4 flex-1">
                  {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Queue is Clear</p>
                        <p className="text-sm text-slate-500">No pending drop recommendations found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {recommendations.map((rec) => (
                        <div key={rec._id} className="group relative bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-slate-900">Drop Request: Learner #{rec.learnerId?.toString().slice(-4)}</h4>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                  <span className="text-slate-400">Reason:</span> {rec.reason}
                                </p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Submitted {new Date(rec.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRecommendation(rec._id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 px-4 rounded-xl"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRecommendation(rec._id, 'rejected')}
                                className="text-rose-600 hover:bg-rose-50 text-xs h-9 px-4 rounded-xl"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="appeals" className="space-y-4 flex-1">
                  {appeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">No Appeals</p>
                        <p className="text-sm text-slate-500">Learner queue looks healthy and quiet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {appeals.map((appeal) => (
                        <div key={appeal._id} className="group relative bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-slate-900">Appeal Submission</h4>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                  {appeal.reason}
                                </p>
                                <p className="text-[11px] text-slate-400">Submitted {new Date(appeal.submittedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAppeal(appeal._id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 px-4 rounded-xl"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAppeal(appeal._id, 'rejected')}
                                className="text-rose-600 hover:bg-rose-50 text-xs h-9 px-4 rounded-xl"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar Area: Cohorts & Insights */}
          <div className="space-y-8">

            {/* Cohorts Overview Sidebar */}
            <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg">Cohort Pulse</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/admin/cohorts')} className="text-indigo-600 text-xs font-semibold hover:bg-indigo-50">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {cohorts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No cohorts found</p>
                ) : (
                  <div className="space-y-4">
                    {cohorts.slice(0, 4).map((cohort) => (
                      <div
                        key={cohort._id}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{cohort.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-semibold tracking-wider underline underline-offset-2">
                              {cohort.learnerIds.length} Learners
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "px-2 py-0 h-5 text-[9px] font-semibold uppercase",
                            cohort.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          )}
                        >
                          {cohort.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => router.push('/admin/cohorts')} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs h-10 group">
                  Full Management
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Platform Health Sidebar */}
            <Card className="rounded-[32px] border-slate-100 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">System Health</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  All modules are operational. Enrollment rates are <span className="text-white font-semibold">14% higher</span> than last semester.
                </p>
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider mb-2 text-indigo-200">
                    <span>Capacity</span>
                    <span>84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[84%] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
