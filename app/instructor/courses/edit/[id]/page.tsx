'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Layers, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

function EditCourseContent() {
    const router = useRouter();
    const params = useParams();
    const courseIdFromParams = params.id as string;

    const [step, setStep] = useState<'details' | 'modules'>('details');
    const [courseData, setCourseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const data = await api.getCourseDetails(courseIdFromParams);
                setCourseData(data);
            } catch (error) {
                console.error('Failed to fetch course:', error);
                toast.error('Could not load course details');
                router.push('/dashboard/courses');
            } finally {
                setIsLoading(false);
            }
        };

        if (courseIdFromParams) {
            fetchCourse();
        }
    }, [courseIdFromParams, router]);

    const handleCourseUpdated = (updatedCourse: any) => {
        setCourseData(updatedCourse);
        setStep('modules');
    };

    const handleFinish = () => {
        toast.success('Course updates finalized!');
        router.push('/dashboard/courses');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50/50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-slate-500 font-medium">Retrieving Course Architecture...</p>
                </div>
            </div>
        );
    }

    if (!courseData) return null;

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 -ml-2 font-bold transition-all"
                            onClick={() => router.push('/dashboard/courses')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                        </Button>
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                                <Sparkles className="w-3 h-3" /> Course Architect
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Update Curriculum</h1>
                            <p className="text-slate-500 font-medium">
                                Refine and expand your instructional materials for <span className="text-indigo-600 font-bold">{courseData.name}</span>.
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
                        <button
                            onClick={() => setStep('details')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                                step === 'details' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                step === 'details' ? "bg-white/20 border-white/30" : "bg-slate-50 border-slate-100")}>
                                1
                            </div>
                            <span className="text-sm font-bold truncate">Course Basics</span>
                        </button>
                        <div className="w-4 h-px bg-slate-100 mx-1" />
                        <button
                            onClick={() => setStep('modules')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                                step === 'modules' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                step === 'modules' ? "bg-white/20 border-white/30" : "bg-slate-50 border-slate-100")}>
                                2
                            </div>
                            <span className="text-sm font-bold truncate">Curriculum</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-[32px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {step === 'details' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CourseForm
                                onSuccess={handleCourseUpdated}
                                initialData={{
                                    id: courseData._id,
                                    name: courseData.name,
                                    description: courseData.description,
                                    duration: courseData.duration
                                }}
                            />
                        </div>
                    )}

                    {step === 'modules' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ModuleManager
                                courseId={courseData._id}
                                initialModules={courseData.modules}
                                onComplete={handleFinish}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EditCoursePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditCourseContent />
        </Suspense>
    );
}
