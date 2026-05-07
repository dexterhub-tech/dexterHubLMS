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
import Link from 'next/link';
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
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCohortForJoin, setSelectedCohortForJoin] = useState<Cohort | null>(null);
  const [denialMessage, setDenialMessage] = useState('');
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
        return { label: 'Active', class: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-500' };
      case 'upcoming':
        return { label: 'Upcoming', class: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500', bg: 'bg-blue-500' };
      case 'completed':
        return { label: 'Completed', class: 'bg-slate-50 text-slate-700', dot: 'bg-slate-500', bg: 'bg-slate-500' };
      default:
        return { label: status, class: 'bg-slate-50 text-slate-700', dot: 'bg-slate-500', bg: 'bg-slate-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            {/* <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> */}
          </div>
          <p className="text-slate-400 font-semibold uppercase tracking-[0.2em] text-[10px] animate-pulse">Loading...</p>
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

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 border-b border-slate-200/60 pb-10">
          <div className="space-y-4">
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
              Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Cohorts.</span>
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-xl">
              Monitor and manage learning cycles, curriculum distribution, and engagement across your teaching network.
            </p>
          </div>

          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-semibold uppercase tracking-wider px-8 shadow-lg shadow-slate-200 transition-all active:scale-95 group">
                  <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
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
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-semibold text-slate-900 px-6"
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
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-semibold text-slate-900 px-6"
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
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-semibold text-slate-900 px-6"
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
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-semibold text-slate-900 px-6"
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
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-semibold text-slate-900 px-6"
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
        {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
        </div> */}

        {/* Cohorts Grid */}
        <div className="space-y-8">
          <div className="grid gap-8">
            {cohorts.map((cohort) => {
              const status = getStatusConfig(cohort.status);
              const isEnrolled = user?.role === 'learner' && (user.activeCohortId === cohort._id || cohort.learnerIds?.includes(user.id));

              return (
                <div key={cohort._id} className="group relative">
                  {/* Card Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[40px] opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-500 pointer-events-none" />

                  <Card 
                    onClick={() => {
                      if (user?.role === 'admin' || user?.role === 'super-admin') {
                        router.push(`/dashboard/cohorts/${cohort._id}`);
                      }
                    }}
                    className={cn(
                      "relative border border-slate-200/60 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-[32px] overflow-hidden group",
                      (user?.role === 'admin' || user?.role === 'super-admin') ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row h-full">
                      {/* Visual Accent */}
                      <div className={cn("w-full lg:w-2 shrink-0", status.bg)} />
                      
                      <div className="flex-1 p-8 lg:p-10 flex flex-col lg:flex-row gap-10 items-start">
                        {/* Main Info */}
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-3">
                            <Badge className={cn("rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-wider border-none shadow-sm", status.class)}>
                              {status.label}
                            </Badge>
                            {isEnrolled && (
                              <Badge className="rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-wider bg-indigo-600 text-white shadow-sm border-none">
                                {/* <Sparkles className="w-3 h-3 mr-1.5" />  */}
                                Enrolled
                              </Badge>
                            )}
                          </div>

                          {(user?.role === 'admin' || user?.role === 'super-admin') ? (
                            <Link href={`/dashboard/cohorts/${cohort._id}`} className="block space-y-3 group/title">
                              <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight group-hover/title:text-indigo-600 transition-colors">
                                {cohort.name}
                              </h3>
                              <p className="text-slate-500 text-base leading-relaxed line-clamp-2">
                                {cohort.description || "Comprehensive learning path designed for industry mastery."}
                              </p>
                            </Link>
                          ) : (
                            <div className="space-y-3">
                              <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight">
                                {cohort.name}
                              </h3>
                              <p className="text-slate-500 text-base leading-relaxed line-clamp-2">
                                {cohort.description || "Comprehensive learning path designed for industry mastery."}
                              </p>
                            </div>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> Learners
                              </p>
                              <p className="text-lg font-semibold text-slate-900">{cohort.learnerIds?.length || 0}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> Starts
                              </p>
                              <p className="text-lg font-semibold text-slate-900">
                                {new Date(cohort.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <GraduationCap className="w-3 h-3" /> Threshold
                              </p>
                              <p className="text-lg font-semibold text-slate-900">{cohort.performanceThreshold}%</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Weekly
                              </p>
                              <p className="text-lg font-semibold text-slate-900">{cohort.weeklyTarget}h</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions / Side Panel */}
                        <div className="w-full lg:w-72 shrink-0 space-y-4">
                          {user?.role === 'learner' ? (
                            isEnrolled ? (
                              <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 text-center space-y-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm text-indigo-600">
                                  <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-900 uppercase">Access Active</p>
                                  <p className="text-[10px] text-slate-400 font-medium">You are currently enrolled</p>
                                </div>
                                <Button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push('/dashboard');
                                  }} 
                                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-all active:scale-95"
                                >
                                  Go to Learning
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCohortForJoin(cohort);
                                    setIsConfirmModalOpen(true);
                                  }}
                                  className={cn(
                                    "w-full h-14 rounded-2xl font-semibold text-sm shadow-lg transition-all active:scale-95",
                                    cohort.status === 'active' || cohort.status === 'upcoming'
                                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                  )}
                                  disabled={cohort.status !== 'upcoming' && cohort.status !== 'active'}
                                >
                                  {cohort.status === 'active' || cohort.status === 'upcoming' ? (
                                    <span className="flex items-center gap-2 justify-center">
                                      Join Cohort <ChevronRight className="w-4 h-4" />
                                    </span>
                                  ) : 'Closed'}
                                </Button>
                                <p className="text-[10px] text-center text-slate-400 font-medium">
                                  Subject to seat availability and requirements
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="space-y-4 bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Syllabus Units</h4>
                                <Badge variant="secondary" className="bg-white text-slate-600 text-[9px] font-semibold">{getCohortCourses(cohort).length}</Badge>
                              </div>
                              
                              <div className="flex -space-x-2 overflow-hidden mb-6">
                                {getCohortCourses(cohort).length === 0 ? (
                                  <p className="text-[10px] text-slate-400 italic">No courses linked</p>
                                ) : (
                                  getCohortCourses(cohort).slice(0, 5).map((course, idx) => (
                                    <div 
                                      key={course._id || course.id} 
                                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-sm shadow-sm"
                                      title={course.name}
                                    >
                                      {course.icon || '📚'}
                                    </div>
                                  ))
                                )}
                              </div>

                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateCourseClick(cohort._id);
                                }}
                                className="w-full h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold text-[10px] transition-all shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Link Unit
                              </Button>
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

      <Dialog open={isAccessDeniedOpen} onOpenChange={setIsAccessDeniedOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-rose-50 p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100 mx-auto animate-bounce-subtle">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Access Restricted</h2>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Security Protocol Active</p>
            </div>
          </div>
          
          <div className="p-12 space-y-8 text-center">
            <p className="text-slate-600 font-medium text-lg leading-relaxed">
              {denialMessage}
            </p>
            
            <Button 
              onClick={() => setIsAccessDeniedOpen(false)}
              className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
              Acknowledged
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-indigo-50 p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100 mx-auto">
              <UserPlus2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Join Cohort</h2>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Deployment Confirmation</p>
            </div>
          </div>
          
          <div className="p-12 space-y-8">
            <div className="space-y-4">
              <p className="text-slate-600 font-medium text-lg leading-relaxed text-center">
                Are you sure you want to join <span className="font-black text-slate-900">{selectedCohortForJoin?.name}</span>?
              </p>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 flex gap-4">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-amber-800 leading-relaxed uppercase tracking-wider">
                  Important: Switching cohorts will reset your current course progress tracking.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="ghost"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!selectedCohortForJoin) return;
                  try {
                    setIsConfirmModalOpen(false);
                    await api.joinCohort(selectedCohortForJoin._id);
                    toast.success('Successfully joined ' + selectedCohortForJoin.name);
                    loadData();
                    await refreshUser();
                  } catch (error: any) {
                    console.error(error);
                    if (error.status === 403) {
                      setDenialMessage(error.message || 'You are not eligible to join this current cohort.');
                      setIsAccessDeniedOpen(true);
                    } else {
                      toast.error(error.message || 'Failed to join cohort');
                    }
                  }
                }}
                className="flex-2 h-16 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
              >
                Confirm Join
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
