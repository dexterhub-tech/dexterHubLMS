'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, Clock, Sparkles, BookOpen, ChevronRight, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CohortsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Ongoing Session',
          class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          dot: 'bg-emerald-500'
        };
      case 'upcoming':
        return {
          label: 'Registration Open',
          class: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          dot: 'bg-indigo-500'
        };
      case 'completed':
        return {
          label: 'Concluded',
          class: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400'
        };
      default:
        return {
          label: status,
          class: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50/50">
        <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="h-48 bg-slate-200 animate-pulse rounded-[32px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-white animate-pulse rounded-[32px] border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeCohortsCount = cohorts.filter(c => c.status === 'active').length;
  const totalLearnersCount = cohorts.reduce((sum, c) => sum + (c.learnerIds?.length || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
        {/* Hero Section */}
        {/* <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-10 md:p-14 text-white shadow-2xl shadow-slate-200">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <LayoutGrid className="w-3.5 h-3.5" /> Academic Directory
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Explore Cohorts</h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Navigate through our standard academic groups. Join an active or upcoming cohort to begin your structured curriculum and connect with peers.
            </p>
            <div className="flex items-center gap-6 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-300 font-semibold">{activeCohortsCount} Active Sessions</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300 font-semibold">{totalLearnersCount} Enrolled Globally</span>
              </div>
            </div>
          </div>
         
          <div className="absolute right-[-5%] top-[-10%] w-[30%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[10%] w-[20%] h-[40%] rounded-full bg-blue-500/10 blur-[80px]" />
        </div> */}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={LayoutGrid}
            label="Total Available"
            value={cohorts.length}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Now"
            value={activeCohortsCount}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            icon={Users}
            label="Knowledge Network"
            value={totalLearnersCount}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
        </div>

        {/* Cohorts List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">

              All Cohorts
            </h2>
          </div>

          <div className="grid gap-8">
            {cohorts.map((cohort) => {
              const status = getStatusConfig(cohort.status);
              const isEnrolled = user?.role === 'learner' && (user.activeCohortId === cohort._id || cohort.learnerIds?.includes(user.id));

              return (
                <Card key={cohort._id} className="group border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 rounded-[32px] overflow-hidden">
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Visual Side */}
                    <div className={cn(
                      "w-full md:w-2 px-1 transition-all duration-500 group-hover:w-3",
                      cohort.status === 'active' ? 'bg-emerald-500' : 'bg-indigo-500'
                    )} />

                    <div className="flex-1 p-8 md:p-10 flex flex-col md:flex-row gap-10">
                      <div className="flex-1 space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                          <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm", status.class)}>
                            <div className={cn("w-1.5 h-1.5 rounded-full mr-2 inline-block", status.dot)} />
                            {status.label}
                          </Badge>
                          {isEnrolled && (
                            <Badge className="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-900 shadow-sm">
                              Your Workspace
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-3xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{cohort.name}</h3>
                          <p className="text-slate-500 mt-3 text-lg font-medium leading-relaxed italic line-clamp-2 max-w-3xl">
                            "{cohort.description}"
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Users className="w-3 h-3" /> Learners
                            </p>
                            <p className="text-xl font-semibold text-slate-800">{cohort.learnerIds?.length || 0}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" /> Start Date
                            </p>
                            <p className="text-sm font-semibold text-slate-700">{new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3" /> Threshold
                            </p>
                            <p className="text-xl font-semibold text-slate-800">{cohort.performanceThreshold}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> Engagement
                            </p>
                            <p className="text-xl font-semibold text-slate-800">{cohort.weeklyTarget}h/wk</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:w-64 flex items-center">
                        {user?.role === 'learner' ? (
                          isEnrolled ? (
                            <Button disabled className="w-full h-14 rounded-2xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 opacity-100 flex items-center gap-2">
                              <Sparkles className="w-5 h-5" />
                              Already Enrolled
                            </Button>
                          ) : (
                            <Button
                              onClick={async () => {
                                if (confirm('Switching cohorts will reset your course progress tracking. Proceed to join?')) {
                                  try {
                                    await api.joinCohort(cohort._id);
                                    toast.success('Successfully joined ' + cohort.name);
                                    const updatedCohorts = await api.getCohorts();
                                    setCohorts(updatedCohorts);
                                    await refreshUser();
                                  } catch (error) {
                                    console.error(error);
                                    toast.error('Failed to join cohort');
                                  }
                                }
                              }}
                              className={cn(
                                "w-full h-14 rounded-2xl font-bold shadow-lg shadow-indigo-100 group/btn transition-all active:scale-95",
                                cohort.status === 'active' || cohort.status === 'upcoming'
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              )}
                              disabled={cohort.status !== 'upcoming' && cohort.status !== 'active'}
                            >
                              {cohort.status === 'active' || cohort.status === 'upcoming' ? (
                                <div className="flex items-center gap-2">
                                  Join Cohort
                                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </div>
                              ) : 'Enrollment Closed'}
                            </Button>
                          )
                        ) : (
                          <div className="space-y-3 w-full">
                            <Button className="w-full h-12 rounded-xl bg-slate-900 border-none font-bold">Manage Learners</Button>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold hover:bg-slate-50">Performance Logic</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {cohorts.length === 0 && (
          <div className="py-20 bg-white rounded-[32px] border border-dashed border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <LayoutGrid className="w-10 h-10 text-slate-300" />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">Academic Grid Empty</h3>
              <p className="text-slate-500 text-sm leading-relaxed">No cohorts have been published to the directory yet. Please check back later.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
