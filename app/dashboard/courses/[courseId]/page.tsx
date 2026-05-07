'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { TopHeader } from '@/components/top-header';
import { CurriculumView } from '@/components/course/curriculum-view';
import { QuizPlayer } from '@/components/course/quiz-player';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ArrowLeft, Video, FileText, Menu, CheckCircle2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RichTextRenderer } from '@/components/shared/rich-text-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    Trophy,
    Info,
    MessageSquare,
    Library
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Submission State
    const [submissionLink, setSubmissionLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingSubmission, setExistingSubmission] = useState<any>(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // Helper to check if a lesson is completed
    const isLessonCompleted = (lesson: any) => {
        if (!lesson) return false;
        const lessonId = String(lesson._id);
        
        // Check if it's in the explicitly completed list
        if (completedLessonIds.includes(lessonId)) return true;

        // Check if there is a submission for this lesson
        const hasSubmission = submissions.some(s => {
            const sLessonId = s.lessonId || s.relatedId;
            return sLessonId && String(sLessonId) === lessonId;
        });

        return hasSubmission;
    };

    // Flattened lessons for easier navigation
    const allLessons = course?.modules?.flatMap((m: any) => m.lessons) || [];
    const currentLessonIndex = allLessons.findIndex((l: any) => l._id === activeLesson?._id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    const prevLesson = allLessons[currentLessonIndex - 1];

    // Calculate overall course progress percentage
    const progressPercentage = course && allLessons.length > 0 
        ? Math.round((completedLessonIds.length / allLessons.length) * 100) 
        : 0;

    useEffect(() => {
        const loadCourse = async () => {
            try {
                if (params.courseId) {
                    const data = await api.getCourseDetails(params.courseId as string);
                    setCourse(data);

                    // Fetch learner progress and tasks for this course
                    if (user) {
                        const [progress, tasks] = await Promise.all([
                            api.getLearnerProgress(user.id),
                            api.getLearnerTasks(user.id)
                        ]);

                        const activeProgress = progress.find(p => {
                            const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                                ? (p.courseId as any)._id
                                : p.courseId;
                            return progressCourseId?.toString() === params.courseId?.toString();
                        });

                        if (activeProgress?.completedLessons) {
                            setCompletedLessonIds(activeProgress.completedLessons.map((id: any) => id.toString()));
                        }

                        // Filter tasks that are assignments for this course to act as "submissions"
                        const courseSubmissions = tasks.filter(t =>
                            t.type === 'Assignment' &&
                            t.courseId?.toString() === params.courseId?.toString() &&
                            (t.status === 'submitted' || t.status === 'completed')
                        );
                        setSubmissions(courseSubmissions);
                    }

                    // Check if a specific lessonId was requested via query param (e.g. from Tasks page)
                    const requestedLessonId = searchParams.get('lessonId');
                    if (requestedLessonId) {
                        let found = false;
                        for (const module of data.modules || []) {
                            const lesson = module.lessons?.find((l: any) => l._id === requestedLessonId);
                            if (lesson) {
                                setActiveLesson(lesson);
                                found = true;
                                break;
                            }
                        }
                        // Fallback to first lesson if requested lesson not found
                        if (!found && data.modules?.[0]?.lessons?.[0]) {
                            setActiveLesson(data.modules[0].lessons[0]);
                        }
                    } else if (data.modules?.[0]?.lessons?.[0]) {
                        // Default to first lesson of first module
                        setActiveLesson(data.modules[0].lessons[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading course:', error);
                toast.error('Failed to load course details');
            } finally {
                setIsLoading(false);
            }
        };
        loadCourse();
    }, [params.courseId, searchParams, user?.id]);

    // Check for existing submission when active lesson changes
    useEffect(() => {
        const checkSubmission = async () => {
            if (!activeLesson?._id || !course || !user) return;

            try {
                // We need the cohortId from the user's progress to check submission
                const progress = await api.getLearnerProgress(user.id);
                const activeProgress = progress.find(p => {
                    const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                        ? (p.courseId as any)._id
                        : p.courseId;
                    const currentCourseId = params.courseId;
                    return progressCourseId?.toString() === currentCourseId?.toString() &&
                        (p.status === 'on-track' || p.status === 'at-risk' || p.status === 'under-review');
                });

                if (activeProgress?.cohortId) {
                    const submission = await api.getMySubmission(activeLesson._id, typeof activeProgress.cohortId === "object" ? (activeProgress.cohortId as any)._id : activeProgress.cohortId);
                    setExistingSubmission(submission);
                    if (submission) {
                        setSubmissionLink(submission.content);
                    } else {
                        setSubmissionLink('');
                    }
                }
            } catch (error) {
                console.error("Failed to check submission", error);
            }
        };

        if (activeLesson?.assignment) {
            checkSubmission();
        } else {
            setExistingSubmission(null);
            setSubmissionLink('');
        }
    }, [activeLesson, course, params.courseId, user]);

    const handleSubmitTask = async () => {
        if (!activeLesson?.assignment || !course) return;

        try {
            setIsSubmitting(true);
            const progress = await api.getLearnerProgress(user!.id);


            // Find active progress for THIS specific course
            const activeProgress = progress.find(p => {
                const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                    ? (p.courseId as any)._id
                    : p.courseId;
                const currentCourseId = params.courseId;

                return progressCourseId?.toString() === currentCourseId?.toString() &&
                    (p.status === 'on-track' || p.status === 'at-risk' || p.status === 'under-review');
            });

            if (!activeProgress || !activeProgress.cohortId) {
                toast.error('You are not currently enrolled in a cohort for this course.');
                return;
            }

            await api.submitAssignment({
                lessonId: activeLesson._id,
                cohortId: typeof activeProgress.cohortId === "object" ? (activeProgress.cohortId as any)._id : activeProgress.cohortId,
                content: submissionLink
            });

            // Refresh submission state
            const newSubmission = await api.getMySubmission(activeLesson._id, typeof activeProgress.cohortId === "object" ? (activeProgress.cohortId as any)._id : activeProgress.cohortId);
            setExistingSubmission(newSubmission);

            // Update completedLessonIds locally if it was a passing grade (for assignments, assume passing if submitted for now, or wait for grade)
            // But since locking depends on passing status (grade >= 5 in backend), we should ideally re-fetch progress
            // Refresh progress and tasks to update sidebar status
            const [updatedProgress, updatedTasks] = await Promise.all([
                api.getLearnerProgress(user!.id),
                api.getLearnerTasks(user!.id)
            ]);

            const newActiveProgress = updatedProgress.find(p => {
                const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                    ? (p.courseId as any)._id
                    : p.courseId;
                return progressCourseId?.toString() === params.courseId?.toString() && (p.status === "on-track" || p.status === "at-risk" || p.status === "under-review");
            });
            if (newActiveProgress?.cohortId) {
                const updatedSubmission = await api.getMySubmission(activeLesson._id, typeof newActiveProgress.cohortId === "object" ? (newActiveProgress.cohortId as any)._id : newActiveProgress.cohortId);
                setExistingSubmission(updatedSubmission);
            }

            if (newActiveProgress?.completedLessons) {
                setCompletedLessonIds(newActiveProgress.completedLessons.map((id: any) => id.toString()));
            }

            const newCourseSubmissions = updatedTasks.filter(t =>
                t.type === 'Assignment' &&
                t.courseId?.toString() === params.courseId?.toString() &&
                (t.status === 'submitted' || t.status === 'completed')
            );
            setSubmissions(newCourseSubmissions);

            toast.success('Task submitted successfully!');
            setShowConfirmSubmit(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuizComplete = async (score: number) => {
        if (!activeLesson?.assignment || !course) return;

        try {
            const progress = await api.getLearnerProgress(user!.id);
            const activeProgress = progress.find(p => {
                const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                    ? (p.courseId as any)._id
                    : p.courseId;
                const currentCourseId = params.courseId;
                return progressCourseId?.toString() === currentCourseId?.toString() && (p.status === "on-track" || p.status === "at-risk" || p.status === "under-review");
            });

            if (!activeProgress || !activeProgress.cohortId) {
                throw new Error('No active enrollment found.');
            }

            await api.submitAssignment({
                lessonId: activeLesson._id,
                cohortId: typeof activeProgress.cohortId === "object" ? (activeProgress.cohortId as any)._id : activeProgress.cohortId,
                content: `Quiz Score: ${score}/${activeLesson.assignment.maxScore}`
            });

            // Refresh progress to get updated completedLessonIds
            // Refresh progress and tasks
            const [updatedProgress, updatedTasks] = await Promise.all([
                api.getLearnerProgress(user!.id),
                api.getLearnerTasks(user!.id)
            ]);

            const newActiveProgress = updatedProgress.find(p => {
                const progressCourseId = typeof p.courseId === 'object' && (p.courseId as any)?._id
                    ? (p.courseId as any)._id
                    : p.courseId;
                return progressCourseId?.toString() === params.courseId?.toString() && (p.status === "on-track" || p.status === "at-risk" || p.status === "under-review");
            });
            if (newActiveProgress?.cohortId) {
                const newSubmission = await api.getMySubmission(activeLesson._id, typeof newActiveProgress.cohortId === "object" ? (newActiveProgress.cohortId as any)._id : newActiveProgress.cohortId);
                setExistingSubmission(newSubmission);
            }

            if (newActiveProgress?.completedLessons) {
                setCompletedLessonIds(newActiveProgress.completedLessons.map((id: any) => id.toString()));
            }

            const newCourseSubmissions = updatedTasks.filter(t =>
                t.type === 'Assignment' &&
                t.courseId?.toString() === params.courseId?.toString() &&
                (t.status === 'submitted' || t.status === 'completed')
            );
            setSubmissions(newCourseSubmissions);
        } catch (error: any) {
            throw error;
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!course) {
        return <div className="p-8 text-center">Course not found.</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            <TopHeader user={user ? { name: `${user.firstName} ${user.lastName}`, email: user.email } : undefined} />
            
            {/* Immersive Header - Simplified */}
            <div className="h-14 border-b border-slate-200 bg-slate-900 px-4 flex items-center justify-between z-20 relative">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()} 
                        className="text-slate-300 hover:text-white hover:bg-white/10 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden md:inline">Exit Course</span>
                    </Button>
                    <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block" />
                    <h1 className="font-medium text-sm text-slate-100 tracking-tight truncate max-w-[150px] md:max-w-[300px]">
                        {course.name}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-3 mr-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Your Progress</span>
                            <div className="flex items-center gap-2">
                                <Progress value={progressPercentage} className="w-24 h-1.5 bg-slate-700" />
                                <span className="text-xs font-medium text-slate-200">{progressPercentage}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-slate-300">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 w-80">
                            <CurriculumView
                                modules={course.modules}
                                activeLessonId={activeLesson?._id}
                                onSelectLesson={(lesson) => {
                                    setActiveLesson(lesson);
                                }}
                                completedLessonIds={completedLessonIds}
                                submissions={submissions}
                                userId={user?.id}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Content Area (Left side in Udemy) - Unified Scroll */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
                    {/* Immersive Player Section */}
                    <div className="w-full bg-black flex items-center justify-center py-0 shadow-lg">
                        {activeLesson ? (
                            activeLesson.videoUrl ? (
                                <div className="w-full max-w-6xl aspect-video mx-auto relative group">
                                    <iframe
                                        src={(() => {
                                            const url = activeLesson.videoUrl;
                                            if (!url) return '';
                                            
                                            // Handle YouTube
                                            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                                                let videoId = '';
                                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                const match = url.match(regExp);
                                                if (match && match[2].length === 11) {
                                                    videoId = match[2];
                                                    return `https://www.youtube.com/embed/${videoId}`;
                                                }
                                            }
                                            
                                            // Handle Google Drive
                                            const driveMatch = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                                            if (driveMatch && driveMatch[1]) {
                                                return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
                                            }
                                            
                                            return url;
                                        })()}
                                        className="w-full h-full border-0 shadow-2xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-[21/9] flex flex-col items-center justify-center text-white p-12 bg-gradient-to-br from-slate-900 to-indigo-950">
                                    <FileText className="w-12 h-12 mb-4 opacity-30 text-indigo-400" />
                                    <h3 className="text-xl font-medium tracking-tight">Text Based Lesson</h3>
                                    <p className="text-slate-400 text-sm font-medium">Scroll down to read the notes and complete tasks</p>
                                </div>
                            )
                        ) : (
                            <div className="w-full aspect-video flex flex-col items-center justify-center text-white p-12 bg-slate-900">
                                <Trophy className="w-16 h-16 mb-6 text-indigo-400 opacity-50" />
                                <h2 className="text-2xl font-medium">Ready to start?</h2>
                                <p className="text-slate-400 mt-3 max-w-sm text-center">Select a lesson from the curriculum sidebar to begin your journey.</p>
                            </div>
                        )}
                    </div>

                    {/* Content Tabs Area - Follows video in natural scroll flow */}
                    <div className="max-w-5xl mx-auto md:px-4 py-5 min-h-screen">
                        {activeLesson && (
                            <Tabs defaultValue="overview" className="p-4 w-full">
                                <TabsList className="bg-white border-b border-slate-100 w-full justify-start rounded h-12 gap-4 md:gap-8 px-0 mb-8 sticky top-0 bg-white/95 backdrop-blur z-20 overflow-x-auto overflow-y-hidden no-scrollbar">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 h-12 text-sm font-medium transition-all whitespace-nowrap">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 h-12 text-sm font-medium transition-all flex gap-2 whitespace-nowrap">
                                        Tasks & Assignments
                                        {activeLesson.assignment?.title && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                                    </TabsTrigger>
                                    <TabsTrigger value="qanda" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 h-12 text-sm font-medium transition-all whitespace-nowrap">
                                        Q&A
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-0 pb-20 focus-visible:ring-0 p-4">
                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-8">
                                            <div>
                                                <h2 className="text-3xl font-medium text-slate-900 tracking-tight leading-tight">{activeLesson.name}</h2>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        {activeLesson.duration}m duration
                                                    </div>
                                                    {isLessonCompleted(activeLesson) && (
                                                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="prose prose-slate max-w-none prose-headings:font-medium prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-indigo-600 prose-img:rounded-2xl md:px-4 break-words overflow-hidden">
                                            {activeLesson.content ? (
                                                <RichTextRenderer content={activeLesson.content} />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                                    <Info className="w-10 h-10 text-slate-200 mb-4" />
                                                    <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">No extra notes</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tasks" className="mt-0 pb-20 focus-visible:ring-0">
                                    {activeLesson.assignment?.title ? (
                                        <div className="max-w-3xl">
                                            {activeLesson.assignment.type === 'quiz' ? (
                                                existingSubmission ? (
                                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                                                                        <CheckCircle2 className="w-6 h-6" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-xl font-medium">Quiz Performance</h4>
                                                                        <p className="text-emerald-50 text-sm opacity-80">Submitted on {new Date(existingSubmission.submittedAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-4xl font-medium">{existingSubmission.grade}/10</div>
                                                                    <div className="text-[10px] font-medium uppercase tracking-widest mt-1 opacity-70">Final Score</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-8 space-y-6">
                                                            <div className="bg-slate-50 rounded-2xl p-6 text-sm text-slate-700 font-medium leading-relaxed border border-slate-100">
                                                                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Your Answer/Result</div>
                                                                "{existingSubmission.content}"
                                                            </div>
                                                            {existingSubmission.feedback && (
                                                                <div className="pt-6 border-t border-slate-100">
                                                                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-3">Instructor Insights</div>
                                                                    <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/30 p-4 rounded-xl border border-indigo-50">{existingSubmission.feedback}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <QuizPlayer quiz={activeLesson.assignment} onComplete={handleQuizComplete} />
                                                )
                                            ) : (
                                                <div className="space-y-8">
                                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                                <Library className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-medium text-slate-900">{activeLesson.assignment.title}</h3>
                                                                <p className="text-slate-500 text-sm font-medium mt-1">Required Assignment</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-slate-50/80 rounded-2xl p-6 text-slate-700 text-sm font-medium leading-relaxed mb-8 border border-slate-100">
                                                            {activeLesson.assignment.description}
                                                        </div>
                                                        
                                                        {existingSubmission ? (
                                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                                                                 <div className="flex items-center gap-3 text-emerald-700 font-medium text-sm mb-4">
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                    <span>Assignment Successfully Submitted</span>
                                                                </div>
                                                                <div className="text-sm text-slate-700 bg-white p-4 rounded-xl border border-emerald-100/50 break-all mb-4 font-medium shadow-sm">
                                                                    {existingSubmission.content}
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full uppercase tracking-widest">
                                                                        {existingSubmission.status}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                                        Ref: {existingSubmission._id.slice(-8).toUpperCase()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-6">
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">Your Solution</label>
                                                                    <Textarea
                                                                        placeholder="Paste your shared link (Google Drive, Dropbox, GitHub, Loom) or type your detailed response here..."
                                                                        value={submissionLink}
                                                                        onChange={(e) => setSubmissionLink(e.target.value)}
                                                                        className="min-h-[200px] bg-slate-50/50 focus:bg-white transition-all border-slate-200 rounded-2xl p-6 text-slate-700 text-sm font-medium shadow-inner"
                                                                    />
                                                                    <p className="text-[10px] text-slate-400 italic ml-1">
                                                                        Tip: If you're submitting a file, upload it to Google Drive and paste the shared link here.
                                                                    </p>
                                                                </div>
                                                                <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            disabled={isSubmitting || !submissionLink.trim()}
                                                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-medium uppercase tracking-widest rounded-2xl text-sm"
                                                                        >
                                                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Confirm Submission'}
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent className="rounded-3xl border-slate-200">
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle className="text-2xl font-medium text-slate-900">Ready to Submit?</AlertDialogTitle>
                                                                            <AlertDialogDescription className="text-slate-600 font-medium">
                                                                                Please double check your work. Once submitted, you won't be able to edit your response until an instructor reviews it.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter className="mt-4">
                                                                            <AlertDialogCancel className="rounded-xl border-slate-200 font-medium">Review Work</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={handleSubmitTask} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium">Submit Now</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                            <Trophy className="w-16 h-16 text-slate-200 mb-6" />
                                            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">No tasks for this lesson</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="qanda" className="mt-0 pb-20 focus-visible:ring-0">
                                    <div className="flex flex-col items-center justify-center py-32 text-center">
                                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8">
                                            <MessageSquare className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-medium text-slate-900 tracking-tight">Student Discussion Board</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto mt-3 font-medium">Join the conversation with fellow learners and instructors. This feature is currently in final testing.</p>
                                        <Button variant="outline" className="mt-8 border-slate-200 rounded-2xl px-10 h-12 font-medium shadow-sm">Notify Me</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                    
                    {/* Floating Next/Prev Navigation - Enhanced UI */}
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-[380px] md:translate-x-0 flex items-center gap-4 z-40">
                         {prevLesson && (
                            <Button 
                                variant="outline" 
                                onClick={() => setActiveLesson(prevLesson)}
                                className="bg-white/95 backdrop-blur-xl shadow-2xl border-slate-200 hover:bg-white font-medium uppercase tracking-widest text-[10px] gap-2 rounded-2xl px-5 h-12 transition-all active:scale-95 group ring-1 ring-slate-900/5"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span>Prev</span>
                            </Button>
                        )}
                        {nextLesson && (
                            <Button 
                                variant="default" 
                                onClick={() => setActiveLesson(nextLesson)}
                                className="bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-200 font-medium uppercase tracking-widest text-[10px] gap-2 rounded-2xl px-8 h-12 transition-all active:scale-95 group ring-1 ring-white/10"
                            >
                                <span>Next Session</span>
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Curriculum (Fixed) */}
                <div className="w-[350px] flex-shrink-0 hidden md:flex flex-col h-full border-l border-slate-200 bg-white relative z-10">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                        <h3 className="font-medium text-slate-900 uppercase tracking-widest text-xs">Curriculum</h3>
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Menu className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <CurriculumView
                            modules={course.modules}
                            activeLessonId={activeLesson?._id}
                            onSelectLesson={setActiveLesson}
                            completedLessonIds={completedLessonIds}
                            submissions={submissions}
                            userId={user?.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
