'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  MoreHorizontal,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Mail,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatCard } from '@/components/stat-card';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Learner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: string;
  activeCohortId?: any;
  createdAt: string;
  performance?: number; // Simulated
  progress?: number; // Simulated
}

export default function LearnersAdminPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Course Transfer State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [fromEnrollment, setFromEnrollment] = useState<any | null>(null);
  const [toCohortId, setToCohortId] = useState('');
  const [toCourseId, setToCourseId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoadingTransferData, setIsLoadingTransferData] = useState(false);

  const handleOpenTransfer = async (learner: Learner) => {
    setSelectedLearner(learner);
    setIsTransferOpen(true);
    setIsLoadingTransferData(true);
    setToCohortId('');
    setToCourseId('');
    setFromEnrollment(null);

    try {
      // 1. Fetch all configurations
      const [cohortsList, coursesList] = await Promise.all([
        api.getCohorts(),
        api.getCourses()
      ]);
      setCohorts(cohortsList);
      setCourses(coursesList);

      // 2. Fetch student's current enrollments
      const progressList = await api.getLearnerProgress(learner._id);
      const active = progressList.find((p: any) => p.status !== 'dropped' && p.courseId && p.cohortId);
      
      if (active) {
        setFromEnrollment(active);
      } else {
        toast.warning("This student does not have any active course enrollment to transfer from.");
      }
    } catch (error) {
      toast.error("Failed to load enrollment information.");
    } finally {
      setIsLoadingTransferData(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearner) return;

    if (!fromEnrollment) {
      toast.error("Active course enrollment required to complete a transfer.");
      return;
    }

    if (!toCohortId || !toCourseId) {
      toast.error("Please select a target cohort and course.");
      return;
    }

    // Prevent transferring to same course/cohort
    const currentCohortId = fromEnrollment.cohortId._id || fromEnrollment.cohortId;
    const currentCourseId = fromEnrollment.courseId._id || fromEnrollment.courseId;
    
    if (currentCohortId.toString() === toCohortId.toString() && currentCourseId.toString() === toCourseId.toString()) {
      toast.error("Target cohort and course must be different from current enrollment.");
      return;
    }

    setIsTransferring(true);
    try {
      await api.transferLearner({
        learnerId: selectedLearner._id,
        fromCohortId: currentCohortId,
        fromCourseId: currentCourseId,
        toCohortId,
        toCourseId
      });
      
      toast.success("Student transferred successfully!");
      setIsTransferOpen(false);
      loadLearners();
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer student");
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setIsLoading(true);
      const users = await api.getAllUsers();
      const filtered = users.filter((u: any) => u.role === 'learner');
      
      // Add some mock data for performance/progress
      const enriched = filtered.map((l: any) => ({
        ...l,
        performance: Math.floor(Math.random() * 30) + 70, // 70-100
        progress: Math.floor(Math.random() * 100)
      }));
      
      setLearners(enriched);
    } catch (error) {
      toast.error('Failed to load learners');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLearners = learners.filter((l) => 
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-96 bg-slate-100 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Student Success</Badge>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Learner Directory</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-lg font-medium">
            Monitor student engagement, track academic performance, and manage cohort enrollments.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-14 px-6 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
            Engagement Report
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 transition-all active:scale-95">
            Add New Learner
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Learners"
          value={learners.length}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Performance"
          value="84%"
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />
        <StatCard
          icon={BookOpen}
          label="Active in Cohorts"
          value={learners.filter(l => l.activeCohortId).length}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />
        <StatCard
          icon={Award}
          label="Certificates Issued"
          value="12"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email or cohort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-[20px] bg-white border-none shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-14 rounded-2xl border-slate-200 px-6 font-bold text-slate-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Status
             </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Performance</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Course Progress</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLearners.map((learner) => (
                <tr key={learner._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-md">
                        <AvatarImage src={learner.avatar} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black">
                          {learner.firstName[0]}{learner.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <p className="text-xs text-slate-400 font-bold tracking-tight uppercase tracking-widest opacity-60">{learner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn(
                        "text-sm font-black",
                        learner.performance! >= 90 ? "text-emerald-600" : 
                        learner.performance! >= 80 ? "text-indigo-600" : "text-amber-600"
                      )}>
                        {learner.performance}%
                      </span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            learner.performance! >= 90 ? "bg-emerald-500" : 
                            learner.performance! >= 80 ? "bg-indigo-500" : "bg-amber-500"
                          )} 
                          style={{ width: `${learner.performance}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-black text-slate-900">{learner.progress}%</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${learner.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest border",
                        learner.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        learner.status === 'dropped' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-700 border-slate-200'
                      )}>
                        {learner.status || 'Active'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        onClick={() => handleOpenTransfer(learner)}
                        variant="ghost" 
                        className="h-10 px-3 gap-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-md font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <BookOpen className="w-4 h-4" />
                        Transfer
                      </Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-md">
                        <ArrowUpRight className="w-5 h-5 text-slate-400" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-md">
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Reviewing <span className="text-slate-900">{filteredLearners.length}</span> candidates
            </p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 bg-white" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-6 border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 bg-white" disabled>Next</Button>
            </div>
        </div>
      </div>

      {/* Transfer Student Modal */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-100 rounded-[32px] p-8 shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-black text-slate-900">Transfer Student</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Move learner to a different cohort and course within the platform directory.
            </DialogDescription>
          </DialogHeader>

          {selectedLearner && (
            <div className="space-y-6 mt-4">
              {/* Learner Info Card */}
              <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <Avatar className="w-12 h-12 rounded-2xl border border-white shadow-sm">
                  <AvatarImage src={selectedLearner.avatar} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black">
                    {selectedLearner.firstName[0]}{selectedLearner.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {selectedLearner.firstName} {selectedLearner.lastName}
                  </h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedLearner.email}</p>
                </div>
              </div>

              {isLoadingTransferData ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading enrollments...</p>
                </div>
              ) : (
                <form onSubmit={handleTransferSubmit} className="space-y-6">
                  {/* Current Enrollment Info */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                      Current Enrollment
                    </span>
                    {fromEnrollment ? (
                      <div className="bg-indigo-50/20 border border-indigo-100/30 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Cohort:</span>
                          <span className="text-indigo-600 font-black">
                            {fromEnrollment.cohortId?.name || 'Default Cohort'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-bold">Course:</span>
                          <span className="text-indigo-600 font-black">
                            {fromEnrollment.courseId?.name || 'Default Course'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50/20 border border-rose-100/30 rounded-2xl p-4 text-xs font-bold text-rose-600 text-center">
                        ⚠️ No active course enrollment detected.
                      </div>
                    )}
                  </div>

                  {/* Transfer Destination fields */}
                  {fromEnrollment && (
                    <div className="space-y-4">
                      {/* Select Target Cohort */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Target Cohort
                        </label>
                        <Select value={toCohortId} onValueChange={(val) => { setToCohortId(val); setToCourseId(''); }}>
                          <SelectTrigger className="w-full bg-slate-50 border-slate-100 h-12 text-slate-900 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500/50 font-bold text-xs uppercase tracking-wider">
                            <SelectValue placeholder="Select target cohort" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-100 rounded-2xl">
                            {cohorts.map((c: any) => (
                              <SelectItem key={c._id} value={c._id} className="text-xs font-bold uppercase tracking-wider">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Select Target Course */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Target Course
                        </label>
                        <Select 
                          value={toCourseId} 
                          onValueChange={setToCourseId}
                          disabled={!toCohortId}
                        >
                          <SelectTrigger className="w-full bg-slate-50 border-slate-100 h-12 text-slate-900 rounded-2xl focus:ring-indigo-500/10 focus:border-indigo-500/50 font-bold text-xs uppercase tracking-wider disabled:opacity-50">
                            <SelectValue placeholder={toCohortId ? "Select target course" : "Select cohort first"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-100 rounded-2xl">
                            {courses
                              .filter((course: any) => {
                                const selectedCohort = cohorts.find(c => c._id === toCohortId);
                                return selectedCohort?.courseIds?.includes(course._id);
                              })
                              .map((course: any) => (
                                <SelectItem key={course._id} value={course._id} className="text-xs font-bold uppercase tracking-wider">
                                  {course.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <DialogFooter className="gap-3 sm:gap-0 mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsTransferOpen(false)}
                      disabled={isTransferring}
                      className="rounded-2xl h-14 font-bold text-slate-600 border-slate-200 bg-white hover:bg-slate-50 flex-1 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isTransferring || !fromEnrollment || !toCohortId || !toCourseId}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 flex-1 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isTransferring ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Transferring...
                        </div>
                      ) : (
                        'Confirm Transfer'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
