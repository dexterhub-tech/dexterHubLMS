'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CurriculumView } from '@/components/course/curriculum-view';
import { QuizPlayer } from '@/components/course/quiz-player';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Loader2, ArrowLeft, Video, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { RichTextRenderer } from '@/components/shared/rich-text-renderer';
import { Menu } from 'lucide-react';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [course, setCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Submission State
    const [submissionLink, setSubmissionLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                if (params.courseId) {
                    const data = await api.getCourseDetails(params.courseId as string);
                    setCourse(data);

                    // Default to first lesson of first module
                    if (data.modules?.[0]?.lessons?.[0]) {
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
    }, [params.courseId]);

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
                    (p.status === 'on-track' || p.status === 'at-risk');
            });

            if (!activeProgress || !activeProgress.cohortId) {
                toast.error('You are not currently enrolled in a cohort for this course.');
                return;
            }

            await api.submitAssignment({
                lessonId: activeLesson._id,
                cohortId: activeProgress.cohortId,
                content: submissionLink
            });
            toast.success('Task submitted successfully!');
            setSubmissionLink('');
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
                return progressCourseId?.toString() === currentCourseId?.toString();
            });

            if (!activeProgress || !activeProgress.cohortId) {
                throw new Error('No active enrollment found.');
            }

            await api.submitAssignment({
                lessonId: activeLesson._id,
                cohortId: activeProgress.cohortId,
                content: `Quiz Score: ${score}/${activeLesson.assignment.maxScore}`
            });
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
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-white">
            {/* Immersive Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm z-20 relative">
                <div className="flex ml-4 items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100/50">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
                    <div className="hidden md:block">
                        <h1 className="font-semibold text-lg text-slate-900 tracking-tight">{course.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-indigo-600">{activeLesson ? activeLesson.name : 'Welcome'}</span>
                            {activeLesson && <span>• {activeLesson.duration} mins</span>}
                        </div>
                    </div>
                    <div className="md:hidden">
                        <h1 className="font-semibold text-base text-slate-900 tracking-tight truncate max-w-[200px]">{activeLesson ? activeLesson.name : course.name}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-slate-500">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                            <CurriculumView
                                modules={course.modules}
                                activeLessonId={activeLesson?._id}
                                onSelectLesson={(lesson) => {
                                    setActiveLesson(lesson);
                                    // Close sheet logic would ideally be here but standard Sheet doesn't expose it easily without state. 
                                    // Users can tap outside to close.
                                }}
                            />
                        </SheetContent>
                    </Sheet>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        Course Overview
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Curriculum */}
                <div className="w-80 flex-shrink-0 hidden md:block h-full border-r border-slate-200 overflow-hidden relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    <CurriculumView
                        modules={course.modules}
                        activeLessonId={activeLesson?._id}
                        onSelectLesson={setActiveLesson}
                    />
                </div>

                {/* Main Content */}
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-12 space-y-6 md:space-y-8">
                        {activeLesson ? (
                            <>
                                {/* Video Player */}
                                {activeLesson.videoUrl && (
                                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 bg-slate-900 aspect-video">
                                        <iframe
                                            src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 items-start">
                                    {/* Content Column */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-slate-900">Session Notes</h2>
                                            </div>
                                            <div className="text-slate-600 leading-relaxed">
                                                {activeLesson.content ? (
                                                    <RichTextRenderer
                                                        content={activeLesson.content}
                                                        className="prose-slate prose-base md:prose-lg max-w-none"
                                                    />
                                                ) : (
                                                    <p className="text-slate-400 italic">No textual content provided for this session.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task / Action Column */}
                                    <div className="xl:col-span-1 space-y-6">
                                        {activeLesson.assignment?.title && (
                                            <>
                                                {activeLesson.assignment.type === 'quiz' ? (
                                                    <QuizPlayer
                                                        quiz={activeLesson.assignment}
                                                        onComplete={handleQuizComplete}
                                                    />
                                                ) : (
                                                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/50 overflow-hidden sticky top-6">
                                                        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white">
                                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                                <FileText className="w-5 h-5" /> Assignment
                                                            </h3>
                                                            <p className="text-indigo-100 text-sm mt-1 opacity-90">
                                                                {activeLesson.assignment.title}
                                                            </p>
                                                        </div>
                                                        <div className="p-6 space-y-4">
                                                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                {activeLesson.assignment.description}
                                                            </p>

                                                            {user?.role === 'learner' ? (
                                                                <div className="space-y-4 pt-2">
                                                                    <div className="space-y-2">
                                                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Submission</label>
                                                                        <Textarea
                                                                            placeholder="Type your answer or paste a link..."
                                                                            value={submissionLink}
                                                                            onChange={(e) => setSubmissionLink(e.target.value)}
                                                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[120px] resize-none"
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        onClick={handleSubmitTask}
                                                                        disabled={isSubmitting}
                                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                                                                    >
                                                                        {isSubmitting ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                        ) : 'Submit Assignment'}
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm flex gap-3">
                                                                    <div className="mt-0.5">ℹ️</div>
                                                                    <p>Instructor View: Learners see a submission form here.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Video className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-900">Ready to start?</h2>
                                <p className="text-slate-500 max-w-md">Select a session from the sidebar to begin watching lessons and completing tasks.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
