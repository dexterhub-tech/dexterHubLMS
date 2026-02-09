'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, Lock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
      setCohorts(allCohorts);

      // 3. Fetch learner progress & applications if learner
      let progress: any[] = [];
      let apps: any[] = [];
      let relevantCourses = allCourses;
      let hasActiveEnrollment = false;

      if (user.role === 'learner') {
        // If no active cohort, we show no courses (empty state handled in UI)
        if (!user.activeCohortId) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        progress = await api.getLearnerProgress(user.id);
        setLearnerProgress(progress);

        // Fetch learner's own applications
        try {
          apps = await api.getMyApplications();
          setApplications(apps);
        } catch (e) {
          console.error("Error fetching applications", e);
        }

        // Filter courses to ONLY those in the active cohort
        const activeCohort = allCohorts.find((c: any) => c._id === user.activeCohortId);
        if (activeCohort) {
          relevantCourses = allCourses.filter((c: any) =>
            activeCohort.courseIds?.some((id: any) => {
              const idStr = typeof id === 'object' ? id._id : id;
              return idStr === c._id;
            })
          );
        } else {
          // Should not happen if activeCohortId is valid, but fallback
          relevantCourses = [];
        }

        // Check if learner has ANY active enrollment or pending application
        // We consider 'completed' as not blocking? User said 'enroll for a particular course'. 
        // Usually 'one course at a time' implies active. If completed, maybe they can take another?
        // Let's assume 'one active course'.
        const activeProgress = progress.find(p =>
          ['on-track', 'at-risk', 'under-review'].includes(p.status) &&
          (typeof p.courseId === 'object' ? p.courseId?._id : p.courseId)
        );
        const activeApp = apps.find(a => ['pending', 'approved'].includes(a.status));

        hasActiveEnrollment = !!activeProgress || !!activeApp;
      }

      // 4. Enhance courses with status relative to learner
      const enhancedData = relevantCourses.map((c: any, i: number) => {
        // Find if learner is enrolled in this course
        const enrollment = progress.find(p => {
          if (!['on-track', 'at-risk', 'under-review', 'completed'].includes(p.status)) return false;

          if (p.courseId) {
            const pId = typeof p.courseId === 'object' ? p.courseId._id : p.courseId;
            return pId === c._id;
          }
          return false;
        });

        // Find if learner has a pending application for this course
        const pendingApp = apps.find(a => {
          const aId = typeof a.courseId === 'object' ? a.courseId._id : a.courseId;
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

        // Determine restriction
        let isRestricted = false;
        if (user.role === 'learner' && status === 'available' && hasActiveEnrollment) {
          isRestricted = true;
        }

        return {
          ...c,
          id: c._id,
          color: c.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
          icon: c.icon || ['💻', '⚛️', '🎨', '🗄️'][i % 4],
          progress: progressVal,
          learnerStatus: status, // 'available', 'pending', 'enrolled'
          isRestricted,
          instructor: 'Assigned Instructor'
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
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  // Open enrollment modal for a locked course
  const openEnrollModal = (course: any) => {
    setSelectedCourse(course);
    setEnrollReason('');
    setShowEnrollModal(true);
  };

  // Handle enrollment form submission
  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !enrollReason.trim()) {
      toast.error("Please provide a reason for enrollment");
      return;
    }

    setIsSubmitting(true);
    try {
      let targetCohortId = null;

      // For learners, always try to apply within their active cohort first
      if (user?.role === 'learner' && user.activeCohortId) {
        targetCohortId = user.activeCohortId;
      } else {
        // Fallback: Find available cohorts for this course
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

      // Apply to the target cohort
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
      fetchData(); // Refresh data
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

        {/* Modern Header */}
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

        {/* Global Alert for Status */}
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

        {(learnerProgress.length === 0 || !learnerProgress.some(p => ['on-track', 'at-risk', 'under-review'].includes(p.status))) && user?.role === 'learner' && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">Not Enrolled in a Cohort</h3>
            <p className="text-indigo-700 mt-2 mb-4">
              Join a cohort to start your learning journey and access courses.
            </p>
            <Button onClick={() => router.push('/dashboard/cohorts')} variant="default" className="bg-indigo-600 text-white hover:bg-indigo-700">
              Browse Cohorts
            </Button>
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
            {/* Search and Filters */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm w-full md:w-fit">
              <div className="relative flex-1 md:w-80">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
              <div className="relative">
                <TabsList className="bg-slate-100/50 p-1 mb-8 h-auto rounded-xl w-full flex overflow-x-auto overflow-y-hidden no-scrollbar justify-start md:justify-start gap-1">
                  <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap">All Courses ({filteredCourses.length})</TabsTrigger>
                  <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap">In Progress ({inProgressCourses.length})</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap">Completed ({completedCourses.length})</TabsTrigger>
                  <TabsTrigger value="not-started" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap">Not Started ({notStartedCourses.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className={cn(
                        "relative group",
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
                        onClick={() => {
                          router.push(`/dashboard/courses/${course.id || course._id}`);
                        }}
                      />

                      {/* Status indicator / Action area for learners */}
                      {user?.role === 'learner' && (
                        <div className="absolute top-4 right-4 z-20">
                          {course.learnerStatus === 'enrolled' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">Enrolled</Badge>
                          ) : course.learnerStatus === 'pending' ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm">Pending</Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-700 border-slate-300 shadow-sm flex items-center gap-1"><Lock className="w-3 h-3" />Locked</Badge>
                          )}
                        </div>
                      )}

                      {/* Instructor Action Overlay - Add to Cohort */}
                      {user?.role === 'instructor' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[220px] text-center space-y-3">
                            <p className="text-sm font-semibold text-slate-800">Add to Cohort</p>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {cohorts.filter(coh => (coh.status === 'upcoming' || coh.status === 'active')).map(coh => {
                                const isInCohort = coh.courseIds?.includes(course.id);
                                return (
                                  <Button
                                    key={coh._id}
                                    size="sm"
                                    disabled={isInCohort}
                                    className={cn(
                                      "w-full text-[11px] h-8 rounded-xl",
                                      isInCohort
                                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isInCohort) {
                                        handleAddToCohort(course.id, coh._id);
                                      }
                                    }}
                                  >
                                    {isInCohort ? '✓ ' : ''}{coh.name}
                                  </Button>
                                );
                              })}
                              {cohorts.filter(coh => (coh.status === 'upcoming' || coh.status === 'active')).length === 0 && (
                                <p className="text-[10px] text-slate-500 font-medium">No active cohorts</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Restricted Course Overlay */}
                      {user?.role === 'learner' && course.isRestricted && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-not-allowed">
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                              <Lock className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">Enrollment Limit</p>
                            <p className="text-[11px] text-slate-500 mt-1">You can only enroll in one course at a time.</p>
                          </div>
                        </div>
                      )}

                      {/* Locked Course Overlay for non-enrolled learners */}
                      {user?.role === 'learner' && course.learnerStatus !== 'enrolled' && !course.isRestricted && (
                        <div
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-pointer transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (course.learnerStatus !== 'pending') {
                              openEnrollModal(course);
                            }
                          }}
                        >
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            {course.learnerStatus === 'pending' ? (
                              <div>
                                <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Pending Approval</p>
                                <p className="text-[11px] text-slate-500 mt-1">Your application is being reviewed</p>
                              </div>
                            ) : (
                              <div>
                                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  <Lock className="w-6 h-6 text-slate-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Course Locked</p>
                                <p className="text-[11px] text-slate-500 mt-1">Tap to apply for enrollment</p>
                                <Button
                                  size="sm"
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-[11px] h-8 rounded-xl mt-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEnrollModal(course);
                                  }}
                                >
                                  Apply to Enroll
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mobile visibility: If not enrolled, show a small action link/button below for better discoverability if hover is not available */}
                      {user?.role === 'learner' && course.learnerStatus === 'available' && (
                        <div className="mt-2 text-center md:hidden">
                          <span className="text-xs font-semibold text-indigo-600">Tap to Enroll</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="in-progress" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map((course) => (
                    <div key={course.id}>
                      <CourseCard
                        title={course.name}
                        subtitle={course.description}
                        icon={course.icon}
                        progress={course.progress}
                        duration={course.duration || 'N/A'}
                        instructor={course.instructor}
                        color={course.color}
                        onClick={() => router.push(`/dashboard/courses/${course.id || course._id}`)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((course) => (
                    <div key={course.id}>
                      <CourseCard
                        title={course.name}
                        subtitle={course.description}
                        icon={course.icon}
                        progress={course.progress}
                        duration={course.duration || 'N/A'}
                        instructor={course.instructor}
                        color={course.color}
                        onClick={() => router.push(`/dashboard/courses/${course.id || course._id}`)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="not-started" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedCourses.map((course) => (
                    <div
                      key={course.id}
                      className={cn(
                        "relative group",
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
                        onClick={() => {
                          router.push(`/dashboard/courses/${course.id || course._id}`);
                        }}
                      />

                      {/* Status indicator / Action area for learners */}
                      {user?.role === 'learner' && (
                        <div className="absolute top-4 right-4 z-20">
                          {course.learnerStatus === 'enrolled' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">Enrolled</Badge>
                          ) : course.learnerStatus === 'pending' ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-sm">Pending</Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-700 border-slate-300 shadow-sm flex items-center gap-1"><Lock className="w-3 h-3" />Locked</Badge>
                          )}
                        </div>
                      )}

                      {/* Restricted Course Overlay */}
                      {user?.role === 'learner' && course.isRestricted && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-not-allowed">
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                              <Lock className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">Enrollment Limit</p>
                            <p className="text-[11px] text-slate-500 mt-1">You can only enroll in one course at a time.</p>
                          </div>
                        </div>
                      )}

                      {/* Locked Course Overlay for non-enrolled learners */}
                      {user?.role === 'learner' && course.learnerStatus !== 'enrolled' && !course.isRestricted && (
                        <div
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/60 backdrop-blur-[2px] rounded-[32px] cursor-pointer transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (course.learnerStatus !== 'pending') {
                              openEnrollModal(course);
                            }
                          }}
                        >
                          <div className="bg-white/95 p-5 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            {course.learnerStatus === 'pending' ? (
                              <div>
                                <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Pending Approval</p>
                                <p className="text-[11px] text-slate-500 mt-1">Your application is being reviewed</p>
                              </div>
                            ) : (
                              <div>
                                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                  <Lock className="w-6 h-6 text-slate-600" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800">Course Locked</p>
                                <p className="text-[11px] text-slate-500 mt-1">Tap to apply for enrollment</p>
                                <Button
                                  size="sm"
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-[11px] h-8 rounded-xl mt-3"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEnrollModal(course);
                                  }}
                                >
                                  Apply to Enroll
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div >
        )
        }
      </div >

      {/* Enrollment Form Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={() => setShowEnrollModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                  {selectedCourse.icon || '📚'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">Apply to Enroll</h3>
                  <p className="text-white/80 text-sm">{selectedCourse.name}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Why do you want to enroll in this course?
                </label>
                <textarea
                  value={enrollReason}
                  onChange={(e) => setEnrollReason(e.target.value)}
                  placeholder="Share your motivation, learning goals, or how this course will benefit you..."
                  className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-slate-400 mt-2">
                  This helps instructors understand your goals and approve your application faster.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">1.</span>
                    <span>Your application will be sent to the instructor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">2.</span>
                    <span>You'll receive a notification once approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">3.</span>
                    <span>The course will unlock and you can start learning!</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setShowEnrollModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                onClick={handleEnrollSubmit}
                disabled={isSubmitting || !enrollReason.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}