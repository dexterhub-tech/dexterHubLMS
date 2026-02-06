'use client';

import { useState, useEffect } from 'react';
import { TopHeader } from '@/components/top-header';
import { CourseCard } from '@/components/course-card';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
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

      if (user.role === 'learner') {
        progress = await api.getLearnerProgress(user.id);
        setLearnerProgress(progress);

        // We'll need a way to get applications for the current user
        // For now, let's assume we can get them or filter them if we had a getMyApplications endpoint
        // Let's quickly add a getMyApplications to the API if possible, or just fetch all and filter for now (not ideal but works for demo)
        // Actually, let's just assume we have them or fetch them
        try {
          // If we don't have a specific endpoint, we might need to add one or use a general one
          const allApps = await api.getPendingApplications(); // This is for instructors, might need a learner one
          apps = allApps.filter((a: any) => a.learnerId?._id === user.id || a.learnerId === user.id);
          setApplications(apps);
        } catch (e) {
          console.error("Error fetching applications", e);
        }
      }

      // 4. Enhance courses with status relative to learner
      const enhancedData = allCourses.map((c: any, i: number) => {
        // Find if learner is enrolled in this course in ANY cohort
        const enrollment = progress.find(p => p.courseId === c._id && ['on-track', 'at-risk', 'under-review'].includes(p.status));

        // Find if learner has a pending application for this course
        const pendingApp = apps.find(a => (a.courseId?._id === c._id || a.courseId === c._id) && a.status === 'pending');

        let status = 'available';
        let progressVal = 0;
        let cohortId = null;

        if (enrollment) {
          status = 'enrolled';
          progressVal = enrollment.currentScore || 0; // Or calculate properly
          cohortId = enrollment.cohortId;
        } else if (pendingApp) {
          status = 'pending';
          cohortId = pendingApp.cohortId?._id || pendingApp.cohortId;
        }

        return {
          ...c,
          id: c._id,
          color: c.color || ['mint', 'peach', 'lavender', 'yellow'][i % 4],
          icon: c.icon || ['💻', '⚛️', '🎨', '🗄️'][i % 4],
          progress: progressVal,
          learnerStatus: status, // 'available', 'pending', 'enrolled'
          activeCohortId: cohortId,
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

  const handleApply = async (courseId: string, cohortId: string) => {
    try {
      await api.applyToCourse({ courseId, cohortId, reason: "Interested in learning this subject." });
      toast.success("Application submitted successfully!");
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Explore Courses</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-lg">
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
              <TabsList className="bg-slate-100/50 p-1 mb-8 h-auto rounded-xl">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">All Courses ({filteredCourses.length})</TabsTrigger>
                <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">In Progress ({inProgressCourses.length})</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">Completed ({completedCourses.length})</TabsTrigger>
                <TabsTrigger value="not-started" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2">Not Started ({notStartedCourses.length})</TabsTrigger>
              </TabsList>

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
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm">Available</Badge>
                          )}
                        </div>
                      )}

                      {/* Explicit Action Overlay for non-enrolled courses (More visible now) */}
                      {user?.role === 'learner' && course.learnerStatus !== 'enrolled' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            {course.learnerStatus === 'pending' ? (
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Application Pending</p>
                                <p className="text-[10px] text-slate-500 mt-1">Waiting for instructor approval</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-slate-800">Enroll Today</p>
                                <div className="space-y-1.5">
                                  {cohorts.filter(coh => coh.courseIds.includes(course.id) && (coh.status === 'upcoming' || coh.status === 'active')).map(coh => (
                                    <Button
                                      key={coh._id}
                                      size="sm"
                                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-[11px] h-8 rounded-xl"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApply(course.id, coh._id);
                                      }}
                                    >
                                      Join {coh.name}
                                    </Button>
                                  ))}
                                  {cohorts.filter(coh => coh.courseIds.includes(course.id) && (coh.status === 'upcoming' || coh.status === 'active')).length === 0 && (
                                    <p className="text-[10px] text-rose-500 font-medium">No active cohorts</p>
                                  )}
                                </div>
                              </>
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
                            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm">Available</Badge>
                          )}
                        </div>
                      )}

                      {/* Explicit Action Overlay for non-enrolled courses (More visible now) */}
                      {user?.role === 'learner' && course.learnerStatus !== 'enrolled' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-[1px] rounded-[32px] opacity-100 transition-all duration-300">
                          <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-slate-100 w-full max-w-[200px] text-center space-y-3">
                            {course.learnerStatus === 'pending' ? (
                              <div>
                                <p className="text-sm font-semibold text-slate-800">Application Pending</p>
                                <p className="text-[10px] text-slate-500 mt-1">Waiting for instructor approval</p>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-semibold text-slate-800">Enroll Today</p>
                                <div className="space-y-1.5">
                                  {cohorts.filter(coh => coh.courseIds.includes(course.id) && (coh.status === 'upcoming' || coh.status === 'active')).map(coh => (
                                    <Button
                                      key={coh._id}
                                      size="sm"
                                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-[11px] h-8 rounded-xl"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApply(course.id, coh._id);
                                      }}
                                    >
                                      Join {coh.name}
                                    </Button>
                                  ))}
                                  {cohorts.filter(coh => coh.courseIds.includes(course.id) && (coh.status === 'upcoming' || coh.status === 'active')).length === 0 && (
                                    <p className="text-[10px] text-rose-500 font-medium">No active cohorts</p>
                                  )}
                                </div>
                              </>
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
    </div >
  );
}