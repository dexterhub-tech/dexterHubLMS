'use client';

import { useEffect, useState } from 'react';
import { api, Cohort } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, Clock, Sparkles, BookOpen, ChevronRight, LayoutGrid, Plus, MoreHorizontal, Settings2, UserPlus2, ShieldCheck, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Course {
  _id: string;
  id?: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export default function CohortsPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    performanceThreshold: 70,
    weeklyTarget: 10,
    status: 'upcoming' as const
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cohortsData, coursesData] = await Promise.all([
        api.getCohorts(),
        api.getCourses()
      ]);
      setCohorts(cohortsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourseClick = (cohortId: string) => {
    router.push(`/instructor/courses/new?cohortId=${cohortId}`);
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const instructorIds: string[] = user?.id ? [user.id] : [];
      await api.createCohort({
        ...newCohort,
        instructorIds
      });
      toast.success('Cohort created successfully');
      setIsModalOpen(false);
      setNewCohort({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        performanceThreshold: 70,
        weeklyTarget: 10,
        status: 'upcoming'
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create cohort');
    } finally {
      setIsCreating(false);
    }
  };

  const getCohortCourses = (cohort: Cohort) => {
    return courses.filter(course => cohort.courseIds?.includes(course._id || course.id || ''));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Ongoing Session',
          class: 'bg-emerald-100 text-emerald-700',
          dot: 'bg-emerald-500'
        };
      case 'upcoming':
        return {
          label: 'Boarding Soon',
          class: 'bg-indigo-100 text-indigo-700',
          dot: 'bg-indigo-500'
        };
      case 'completed':
        return {
          label: 'Concluded',
          class: 'bg-slate-100 text-slate-600',
          dot: 'bg-slate-400'
        };
      default:
        return {
          label: status,
          class: 'bg-slate-100 text-slate-600',
          dot: 'bg-slate-400'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  const activeCohortsCount = cohorts.filter(c => c.status === 'active').length;
  const totalLearnersCount = cohorts.reduce((sum, c) => sum + (c.learnerIds?.length || 0), 0);

  return (
    <div className="min-h-screen bg-neutral-50/30 pb-32 relative overflow-hidden">
      {/* Background Bloom Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-50/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-2">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Network Management
            </div> */}
            <h1 className="text-xl md:text-3xl font-medium font-black text-slate-900 tracking-tight uppercase">
              Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Cohorts.</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-md leading-relaxed max-w-xl">
              Monitor and manage learning cycles, curriculum distribution, and student engagement across your teaching network.
            </p>
          </div>

          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest px-8 shadow-xl shadow-indigo-100 transition-all active:scale-95 group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  New Cohort
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                <form onSubmit={handleCreateCohort}>
                  <div className="p-10 space-y-8">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-normal font-black text-slate-900 uppercase tracking-tight">Create Cohort</DialogTitle>
                      <DialogDescription className="text-slate-500 font-medium text-base">
                        Define the parameters for a new intensive learning group.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Name</Label>
                        <Input
                          id="name"
                          required
                          placeholder="e.g. Q3 Engineering Intensive"
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-slate-900 px-6"
                          value={newCohort.name}
                          onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Core Objectives</Label>
                        <Textarea
                          id="description"
                          placeholder="What makes this cohort unique?"
                          className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium min-h-[120px] px-6 py-4"
                          value={newCohort.description}
                          onChange={(e) => setNewCohort({ ...newCohort, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="startDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Launch Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            required
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-slate-900 px-6"
                            value={newCohort.startDate}
                            onChange={(e) => setNewCohort({ ...newCohort, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="endDate" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Conclusion</Label>
                          <Input
                            id="endDate"
                            type="date"
                            required
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-slate-900 px-6"
                            value={newCohort.endDate}
                            onChange={(e) => setNewCohort({ ...newCohort, endDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="threshold" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pass Ratio (%)</Label>
                          <Input
                            id="threshold"
                            type="number"
                            min="0"
                            max="100"
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-slate-900 px-6"
                            value={newCohort.performanceThreshold}
                            onChange={(e) => setNewCohort({ ...newCohort, performanceThreshold: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="target" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hrs/Week</Label>
                          <Input
                            id="target"
                            type="number"
                            min="1"
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold text-slate-900 px-6"
                            value={newCohort.weeklyTarget}
                            onChange={(e) => setNewCohort({ ...newCohort, weeklyTarget: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="bg-slate-50/50 p-10 pt-8 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-indigo-200/50 active:scale-[0.98] transition-all"
                    >
                      {isCreating ? 'Provisioning...' : 'Provision Workspace'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="group bg-white rounded-xl md:rounded-[32px] p-4 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-medium font-black text-slate-400  tracking-widest">Available Cohorts</p>
                <h3 className="text-lg md:text-4xl font-medium font-black text-slate-900 tracking-tight">{cohorts.length}</h3>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl md:rounded-[32px] p-4 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 font-medium tracking-widest">Active Cycles</p>
                <h3 className="text-lg md:text-4xl font-medium font-black text-slate-900 tracking-tight">{activeCohortsCount}</h3>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-xl md:rounded-[32px] p-4 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 font-medium tracking-widest">Global Network</p>
                <h3 className="text-lg md:text-4xl font-medium font-black text-slate-900 tracking-tight">{totalLearnersCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Cohorts Grid */}
        <div className="space-y-8">
          <div className="grid gap-8">
            {cohorts.map((cohort) => {
              const status = getStatusConfig(cohort.status);
              const isEnrolled = user?.role === 'learner' && (user.activeCohortId === cohort._id || cohort.learnerIds?.includes(user.id));

              return (
                <div key={cohort._id} className="group relative">
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[40px] opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500" />

                  <Card className="relative border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[40px] overflow-hidden">
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col lg:flex-row p-10 lg:p-14 gap-12 lg:items-start">
                        {/* Summary Block */}
                        <div className="flex-1 space-y-10">
                          <div className="flex flex-wrap items-center gap-4">
                            <Badge className={cn("rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm border-none", status.class)}>
                              <div className={cn("w-1.5 h-1.5 rounded-full mr-2 inline-block", status.dot)} />
                              {status.label}
                            </Badge>
                            {isEnrolled && (
                              <Badge className="rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-sm border-none">
                                <Sparkles className="w-3 h-3 mr-2" /> Current Workspace
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight font-medium uppercase group-hover:text-indigo-600 transition-colors">
                              {cohort.name}
                            </h3>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed italic max-w-4xl border-l-[3px] border-slate-100 pl-6 py-2">
                              "{cohort.description || "Transformative learning at scale."}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-8 md:gap-14">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" /> Learner Pool
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black font-medium text-slate-900">{cohort.learnerIds?.length || 0}</span>
                                <span className="text-sm font-bold text-slate-400">Total</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Commencement
                              </p>
                              <p className="text-xl font-black text-slate-900 font-medium">
                                {new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5" /> Target Ratio
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-slate-900 font-medium">{cohort.performanceThreshold}%</span>
                                <Badge variant="outline" className="text-[8px] font-black border-slate-200">PASS</Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Intensity
                              </p>
                              <p className="text-xl font-black text-slate-900 font-medium">{cohort.weeklyTarget}h <span className="text-sm text-slate-400">/ week</span></p>
                            </div>
                          </div>
                        </div>

                        {/* Action Block */}
                        <div className="lg:w-80 w-full shrink-0">
                          {user?.role === 'learner' ? (
                            isEnrolled ? (
                              <div className="w-full p-8 rounded-[32px] bg-slate-50 border border-slate-100 text-center space-y-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-emerald-500">
                                  <ShieldCheck className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight">Identity Confirmed <br /><span className="text-emerald-600">Active Access</span></p>
                                <Button onClick={() => router.push('/dashboard')} className="w-full h-12 rounded-xl bg-slate-900 border-none font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 active:scale-95 transition-all">
                                  Enter Dashboard
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={async () => {
                                  if (confirm('Switching cohorts will reset your course progress tracking. Proceed to join?')) {
                                    try {
                                      await api.joinCohort(cohort._id);
                                      toast.success('Successfully joined ' + cohort.name);
                                      loadData();
                                      await refreshUser();
                                    } catch (error) {
                                      console.error(error);
                                      toast.error('Failed to join cohort');
                                    }
                                  }
                                }}
                                className={cn(
                                  "w-full h-20 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all active:scale-95",
                                  cohort.status === 'active' || cohort.status === 'upcoming'
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                )}
                                disabled={cohort.status !== 'upcoming' && cohort.status !== 'active'}
                              >
                                {cohort.status === 'active' || cohort.status === 'upcoming' ? (
                                  <div className="flex items-center gap-3">
                                    Request Enrollment
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                  </div>
                                ) : 'Registration Locked'}
                              </Button>
                            )
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-slate-50/80 backdrop-blur-sm rounded-[32px] p-8 border border-slate-100 shadow-inner group/courses transition-all duration-500">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                                  <span>Curriculum Mapping</span>
                                  <Badge className="bg-white text-slate-900 border-slate-100 text-[10px] shadow-none">{getCohortCourses(cohort).length} Units</Badge>
                                </h4>

                                <div className="space-y-3 mb-8">
                                  {getCohortCourses(cohort).length === 0 ? (
                                    <div className="text-center py-6 space-y-2">
                                      <BookOpen className="w-6 h-6 text-slate-300 mx-auto" />
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Inventory Empty</p>
                                    </div>
                                  ) : (
                                    getCohortCourses(cohort).slice(0, 3).map(course => (
                                      <div key={course._id || course.id} className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-white shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200 transition-all cursor-pointer group/item">
                                        <span className="text-xl group-hover/item:scale-125 transition-transform duration-300">{course.icon || '📚'}</span>
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate shrink-1">{course.name}</span>
                                      </div>
                                    ))
                                  )}
                                  {getCohortCourses(cohort).length > 3 && (
                                    <p className="text-[10px] font-black text-indigo-500 text-center pt-2 tracking-[0.2em]">+{getCohortCourses(cohort).length - 3} ADDITIONAL UNITS</p>
                                  )}
                                </div>

                                <Button
                                  onClick={() => handleCreateCourseClick(cohort._id)}
                                  className="w-full h-12 rounded-xl bg-white border border-slate-100 text-slate-900 hover:text-white hover:border-indigo-100 font-black uppercase tracking-widest text-[9px] shadow-sm active:scale-95 transition-all"
                                >
                                  <Plus className="w-4 h-4 mr-2" />Create course
                                </Button>
                              </div>

                              {/* <div className="grid grid-cols-2 gap-3 pb-2">
                                <Button className="h-12 rounded-[20px] bg-slate-900 border-none font-black uppercase tracking-widest text-[9px] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95">
                                  <UserPlus2 className="w-3.5 h-3.5 mr-2" /> Network
                                </Button>
                                <Button variant="outline" className="h-12 rounded-[20px] border-slate-200 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all active:scale-95">
                                  <Settings2 className="w-3.5 h-3.5 mr-2" /> Global
                                </Button>
                              </div> */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
