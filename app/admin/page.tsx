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
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          <div className="h-10 bg-slate-200 animate-pulse rounded-lg w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10">

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/60 transition-all duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-50/80 text-indigo-700 border-indigo-100 px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase backdrop-blur-sm">Admin Console</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900">Platform Overview</h1>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg font-light">
              Monitor systems, manage student lifecycles, and handle administrative requests.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button
              onClick={() => router.push('/admin/applications')}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 font-medium h-10 px-4"
            >
              Applications
            </Button>
            <Button
              onClick={() => router.push('/admin/cohorts')}
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 font-medium h-10 px-4"
            >
              Manage Cohorts
            </Button>
            <Button
              onClick={() => router.push('/admin/learners')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md active:scale-95 duration-200 rounded-xl font-medium h-10 px-4"
            >
              <Users className="w-4 h-4 mr-2" />
              Users Directory
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <StatCard
              icon={BookOpen}
              label="Active Cohorts"
              value={activeCohorts}
              iconColor="text-blue-500"
              iconBgColor="bg-blue-50/50"
              trend={{ value: '12% inc', isPositive: true }}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
            <StatCard
              icon={Users}
              label="Total Learners"
              value={totalLearners}
              iconColor="text-emerald-500"
              iconBgColor="bg-emerald-50/50"
              trend={{ value: '2.4k new', isPositive: true }}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
            <StatCard
              icon={AlertCircle}
              label="Pending Reviews"
              value={pendingRecommendations}
              iconColor="text-rose-500"
              iconBgColor="bg-rose-50/50"
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
            <StatCard
              icon={Shield}
              label="Open Appeals"
              value={pendingAppeals}
              iconColor="text-amber-500"
              iconBgColor="bg-amber-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Main Action Area (Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 md:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full min-h-[450px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-medium text-slate-900">Administrative Queue</h3>
                  <p className="text-slate-500 text-sm mt-1 font-light">Actions requiring your immediate attention</p>
                </div>
                <div className="flex items-center w-fit gap-1.5 bg-slate-50/80 p-1.5 rounded-xl border border-slate-100/50 backdrop-blur-sm">
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-500 px-2 py-0.5 border-transparent bg-transparent hover:bg-transparent capitalize">Updated: Just now</Badge>
                </div>
              </div>

              <Tabs defaultValue="recommendations" className="space-y-6 flex-1 flex flex-col">
                <TabsList className="bg-slate-100/50 p-1 h-auto rounded-xl inline-flex w-full sm:w-fit mb-2">
                  <TabsTrigger value="recommendations" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 md:px-6 py-2.5 text-sm transition-all duration-200 font-medium">
                    Recommendations
                    {pendingRecommendations > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-rose-500/90 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                        {pendingRecommendations}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="appeals" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 md:px-6 py-2.5 text-sm transition-all duration-200 font-medium">
                    Appeals
                    {pendingAppeals > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-500/90 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                        {pendingAppeals}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recommendations" className="space-y-4 flex-1 focus-visible:outline-none">
                  {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in fade-in duration-500">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/50">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Queue is Clear</p>
                        <p className="text-sm text-slate-500 font-light max-w-[200px] mt-1">No pending drop recommendations found</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {recommendations.map((rec, i) => (
                        <div
                          key={rec._id}
                          className="animate-in fade-in slide-in-from-top-2 duration-300 group relative bg-slate-50/40 rounded-2xl p-4 md:p-5 border border-slate-100/60 hover:bg-white hover:border-indigo-100 hover:shadow-[0_4px_20px_rgba(79,70,229,0.06)] transition-all duration-300"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100/50">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                                <h4 className="font-medium text-slate-900 text-sm md:text-base">Drop Request: Learner #{rec.learnerId?.toString().slice(-4)}</h4>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                                  <span className="text-slate-400 font-light">Reason:</span> {rec.reason}
                                </p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-light">
                                  <Calendar className="w-3 h-3" /> Submitted {new Date(rec.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleRecommendation(rec._id, 'approved')}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-[11px] h-8 px-4 rounded-lg font-medium shadow-none hover:shadow-md active:scale-95 transition-all"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRecommendation(rec._id, 'rejected')}
                                className="flex-1 sm:flex-none text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[11px] h-8 px-4 rounded-lg font-medium active:scale-95 transition-all"
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

                <TabsContent value="appeals" className="space-y-4 flex-1 focus-visible:outline-none">
                  {appeals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 animate-in fade-in duration-500">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100/50">
                        <Shield className="w-8 h-8 text-blue-500/80" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">No Appeals</p>
                        <p className="text-sm text-slate-500 font-light max-w-[200px] mt-1">Learner queue looks healthy and quiet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {appeals.map((appeal, i) => (
                        <div
                          key={appeal._id}
                          className="animate-in fade-in slide-in-from-top-2 duration-300 group relative bg-slate-50/40 rounded-2xl p-4 md:p-5 border border-slate-100/60 hover:bg-white hover:border-indigo-100 hover:shadow-[0_4px_20px_rgba(79,70,229,0.06)] transition-all duration-300"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50">
                                  <Shield className="w-4 h-4" />
                                </div>
                                <h4 className="font-medium text-slate-900 text-sm md:text-base">Appeal Submission</h4>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                                  {appeal.reason}
                                </p>
                                <p className="text-[11px] text-slate-400 font-light">Submitted {new Date(appeal.submittedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleAppeal(appeal._id, 'approved')}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-[11px] h-8 px-4 rounded-lg font-medium shadow-none hover:shadow-md active:scale-95 transition-all"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAppeal(appeal._id, 'rejected')}
                                className="flex-1 sm:flex-none text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[11px] h-8 px-4 rounded-lg font-medium active:scale-95 transition-all"
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
          <div className="space-y-6 md:space-y-8">

            {/* Cohorts Overview Sidebar */}
            <Card className="rounded-[24px] md:rounded-[32px] border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden bg-white/90 backdrop-blur-md">
              <CardHeader className="bg-slate-50/40 border-b border-slate-100/50 p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <CardTitle className="text-base md:text-lg font-medium">Cohort Pulse</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/admin/cohorts')} className="text-indigo-600 text-[11px] font-medium hover:bg-indigo-50/80 h-7 px-3 rounded-lg">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6">
                {cohorts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 font-light text-sm italic">No cohorts found</p>
                ) : (
                  <div className="space-y-3">
                    {cohorts.slice(0, 4).map((cohort) => (
                      <div
                        key={cohort._id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100/50 group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{cohort.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase font-medium tracking-wide">
                              {cohort.learnerIds.length} Learners
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "px-2 py-0 h-4 md:h-5 text-[8px] md:text-[9px] font-medium uppercase border shadow-none",
                            cohort.status === 'active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100/40'
                              : 'bg-slate-50 text-slate-500 border-slate-200/40'
                          )}
                        >
                          {cohort.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={() => router.push('/admin/cohorts')} className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] h-10 group transition-all duration-200 active:scale-95 shadow-lg shadow-slate-200 font-medium">
                  Full Management
                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* Platform Health Sidebar */}
            <Card className="rounded-[24px] md:rounded-[32px] border-indigo-400 shadow-xl shadow-indigo-100/50 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white">
              <CardContent className="p-6 md:p-8 space-y-5">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg md:text-xl font-medium">System Health</h3>
                  <p className="text-indigo-50/80 text-xs md:text-sm leading-relaxed font-light">
                    All modules are operational. Enrollment rates are <span className="text-white font-medium">14% higher</span> than last semester.
                  </p>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] md:text-[11px] font-medium uppercase tracking-wider mb-2.5 text-indigo-100/90">
                    <span>Performance</span>
                    <span>92%</span>
                  </div>
                  <div className="h-1.5 md:h-2 w-full bg-black/10 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full w-[92%] bg-gradient-to-r from-white/80 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out"
                    />
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

