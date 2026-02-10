'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, Lock, X, Edit3, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [learnerProgress, setLearnerProgress] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const router = useRouter();

  // Enrollment modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrollReason, setEnrollReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // 1. Fetch all courses
      const allCourses = await api.getCourses();

      // 2. Fetch all available cohorts
      const allCohorts = await api.getCohorts();

      // Filter cohorts for instructors to only show what they manage
      let managedCohorts = allCohorts;
      if (user.role === 'instructor') {
        managedCohorts = allCohorts.filter((c: any) =>
          c.instructorIds?.some((id: any) => {
            const idStr = typeof id === 'object' ? id._id : id;
            return idStr === user.id;
          })
        );
      }
      setCohorts(managedCohorts);

      // 3. Fetch learner progress & applications if learner
      let progress: any[] = [];
      let apps: any[] = [];
      let relevantCourses = allCourses;
      let hasActiveEnrollment = false;

      if (user.role === 'learner') {
        if (!user.activeCohortId) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        progress = await api.getLearnerProgress(user.id);
        setLearnerProgress(progress);

        try {
          apps = await api.getMyApplications();
          setApplications(apps);
        } catch (e) {
          console.error("Error fetching applications", e);
        }

        const activeCohort = allCohorts.find((c: any) => c._id === user.activeCohortId);
        if (activeCohort) {
          relevantCourses = allCourses.filter((c: any) =>
            activeCohort.courseIds?.some((id: any) => {
              const idStr = typeof id === 'object' ? id._id : id;
              return idStr === c._id;
            })
          );
        } else {
          relevantCourses = [];
        }

        const activeProgress = progress.find(p =>
          ['on-track', 'at-risk', 'under-review'].includes(p.status) &&
          (typeof p.courseId === 'object' ? p.courseId?._id : p.courseId)
        );
        const activeApp = apps.find(a => ['pending', 'approved'].includes(a.status));
        hasActiveEnrollment = !!activeProgress || !!activeApp;
      }

      // 4. Enhance courses with status relative to learner/instructor
      const enhancedData = relevantCourses.map((c: any, i: number) => {
        const enrollment = progress.find(p => {
          if (!['on-track', 'at-risk', 'under-review', 'completed'].includes(p.status)) return false;
          const pId = typeof p.courseId === 'object' ? p.courseId?._id : p.courseId;
          return pId === c._id;
        });

        const pendingApp = apps.find(a => {
          const aId = typeof a.courseId === 'object' ? a.courseId?._id : a.courseId;
          return aId === c._id && a.status === 'pending';
        });

        let status = 'available';
        let progressVal = 0;

        if (enrollment) {
          status = 'enrolled';
          progressVal = enrollment.currentScore || 0;
        } else if (pendingApp) {
          status = 'pending';
        }

        let isRestricted = false;
        if (user.role === 'learner' && status === 'available' && hasActiveEnrollment) {
          isRestricted = true;
        }

        // Instructor logic for cohort assignment tracking
        const assignedInAllManaged = managedCohorts.length > 0 && managedCohorts.every(coh =>
          coh.courseIds?.some((id: any) => {
            const idStr = typeof id === 'object' ? id._id : id;
            return idStr === c._id;
          })
        );

        return {
          ...c,
          id: c._id,
          color: c.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
          icon: c.icon || ['💻', '⚛️', '🎨', '🗄️'][i % 4],
          progress: progressVal,
          learnerStatus: status,
          isRestricted,
          instructor: 'Assigned Instructor',
          assignedInAllManaged
        };
      });

      setCourses(enhancedData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApply = async (courseId: string, cohortId: string, reason: string = "") => {
    try {
      await api.applyToCourse({ courseId, cohortId, reason: reason || "Interested in learning this subject." });
      toast.success("Application submitted successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  const openEnrollModal = (course: any) => {
    setSelectedCourse(course);
    setEnrollReason('');
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !enrollReason.trim()) {
      toast.error("Please provide a reason for enrollment");
      return;
    }

    setIsSubmitting(true);
    try {
      let targetCohortId = null;

      if (user?.role === 'learner' && user.activeCohortId) {
        targetCohortId = user.activeCohortId;
      } else {
        const availableCohorts = cohorts.filter(
          (coh: any) => coh.courseIds?.some((id: any) => {
            const cId = typeof id === 'object' ? id._id : id;
            return cId?.toString() === selectedCourse.id?.toString();
          }) && (coh.status === 'upcoming' || coh.status === 'active')
        );

        if (availableCohorts.length > 0) {
          targetCohortId = availableCohorts[0]._id;
        }
      }

      if (!targetCohortId) {
        toast.error("No active cohorts available for this course");
        return;
      }

      await handleApply(selectedCourse.id, targetCohortId, enrollReason);
      setShowEnrollModal(false);
      setSelectedCourse(null);
      setEnrollReason('');
    } catch (error: any) {
      toast.error(error.message || "Failed to submit enrollment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCohort = async (courseId: string, cohortId: string) => {
    try {
      await api.addCourseToCohort(cohortId, courseId);
      toast.success("Course added to cohort successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add course to cohort");
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inProgressCourses = filteredCourses.filter(c => c.status === 'in-progress');
  const completedCourses = filteredCourses.filter(c => c.status === 'completed');
  const notStartedCourses = filteredCourses.filter(c => c.status === 'not-started');

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase">Explore Courses</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-lg font-medium">
              Manage your curriculum, track progress, and access learning materials.
            </p>
          </div>
          {user?.role === 'instructor' && (
            <Button onClick={() => router.push('/instructor/courses/new')} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all hover:shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          )}
        </div>

        {learnerProgress.some(p => p.status === 'under-review') && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rose-900">Performance Review Required</h3>
              <p className="text-rose-700 text-sm mt-1">
                Your performance is currently under review (Grade &lt; 50%). Please contact your instructor.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-full md:w-fit">
              <div className="relative flex-1 md:w-80">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2 text-sm outline-none bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-slate-100/50 p-1 mb-8 h-auto rounded-xl w-full flex overflow-x-auto overflow-y-hidden no-scrollbar justify-start gap-1">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">All Courses ({filteredCourses.length})</TabsTrigger>
                <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">In Progress ({inProgressCourses.length})</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">Completed ({completedCourses.length})</TabsTrigger>
                <TabsTrigger value="not-started" className="rounded-lg data-[state=active]:bg-white px-4 py-2 text-xs md:text-sm font-bold">Not Started ({notStartedCourses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className={cn(
                        "relative group h-full",
                        (user?.role === 'instructor' || course.learnerStatus === 'enrolled') ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      <CourseCard
                        title={course.name}
                        subtitle={course.description}
                        icon={course.icon}
                        progress={course.progress}
                        duration={course.duration || 'N/A'}
                        instructor={course.instructor}
                        registrarsCount={user?.role === 'instructor' ? course.registrarsCount : undefined}
                        color={course.color}
                        onClick={() => router.push(`/dashboard/courses/${course.id || course._id}`)}
                      />

                      {user?.role === 'learner' && (
                        <div className="absolute top-4 right-4 z-20">
                          {course.learnerStatus === 'enrolled' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm font-bold px-3">Enrolled</Badge>
                          ) : course.learnerStatus === 'pending' ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm font-bold px-3">Pending</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 shadow-sm flex items-center gap-1 font-bold px-3"><Lock className="w-3 h-3" />Locked</Badge>
                          )}
                        </div>
                      )}

                      {user?.role === 'instructor' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-[2px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[240px] text-center space-y-4">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/instructor/courses/edit/${course.id}`);
                              }}
                              variant="outline"
                              className="w-full h-10 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Update Content
                            </Button>

                            {!course.assignedInAllManaged ? (
                              <div className="space-y-2 pt-2 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left pl-1">Assign to Cohort</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {cohorts.map(coh => {
                                    const isInCohort = coh.courseIds?.some((id: any) => (typeof id === 'object' ? id._id : id) === course.id);
                                    return (
                                      <Button
                                        key={coh._id}
                                        size="sm"
                                        disabled={isInCohort}
                                        className={cn(
                                          "w-full text-left justify-start text-[10px] h-8 rounded-lg font-bold px-3",
                                          isInCohort ? "bg-emerald-50 text-emerald-600 border-none" : "bg-indigo-600 text-white"
                                        )}
                                        onClick={(e) => { e.stopPropagation(); if (!isInCohort) handleAddToCohort(course.id, coh._id); }}
                                      >
                                        <div className="truncate flex-1">{coh.name}</div>
                                        {isInCohort && <span className="ml-2">✓</span>}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-slate-50">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none font-bold py-1 px-4">
                                  Assigned to All Cohorts
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {user?.role === 'learner' && course.isRestricted && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px]">
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl w-full max-w-[200px] text-center space-y-3">
                            <Lock className="w-6 h-6 mx-auto text-slate-400" />
                            <p className="text-sm font-semibold text-slate-800">Enrollment Limit</p>
                            <p className="text-[11px] text-slate-500">You can only enroll in one course at a time.</p>
                          </div>
                        </div>
                      )}

                      {user?.role === 'learner' && course.learnerStatus !== 'enrolled' && !course.isRestricted && (
                        <div
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); if (course.learnerStatus !== 'pending') openEnrollModal(course); }}
                        >
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl w-full max-w-[200px] text-center space-y-3">
                            {course.learnerStatus === 'pending' ? (
                              <>
                                <AlertCircle className="w-6 h-6 mx-auto text-amber-600" />
                                <p className="text-sm font-semibold text-slate-800">Pending Approval</p>
                              </>
                            ) : (
                              <>
                                <Lock className="w-6 h-6 mx-auto text-slate-600" />
                                <p className="text-sm font-semibold text-slate-800">Course Locked</p>
                                <Button size="sm" className="w-full bg-indigo-600 text-[11px] h-8 rounded-xl" onClick={(e) => { e.stopPropagation(); openEnrollModal(course); }}>Apply to Enroll</Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="in-progress" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map(course => (
                    <CourseCard key={course.id} {...course} onClick={() => router.push(`/dashboard/courses/${course.id}`)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map(course => (
                    <CourseCard key={course.id} {...course} onClick={() => router.push(`/dashboard/courses/${course.id}`)} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="not-started" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedCourses.map(course => (
                    <CourseCard key={course.id} {...course} onClick={() => router.push(`/dashboard/courses/${course.id}`)} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4"><X className="w-6 h-6" /></button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">{selectedCourse.icon || '📚'}</div>
                <div><h3 className="text-xl font-bold">Apply to Enroll</h3><p className="text-white/80 text-sm">{selectedCourse.name}</p></div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Why do you want to enroll?</label>
              <textarea value={enrollReason} onChange={(e) => setEnrollReason(e.target.value)} className="w-full h-32 px-4 py-3 border rounded-xl" />
              <div className="p-6 flex gap-3"><Button variant="outline" className="flex-1" onClick={() => setShowEnrollModal(false)}>Cancel</Button><Button className="flex-1 bg-indigo-600" onClick={handleEnrollSubmit} disabled={isSubmitting || !enrollReason.trim()}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}