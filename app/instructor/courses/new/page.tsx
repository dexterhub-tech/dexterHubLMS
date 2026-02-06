'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/instructor/course-builder/course-form';
import { ModuleManager } from '@/components/instructor/course-builder/module-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Layers, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateCoursePage() {
    const router = useRouter();
    const [step, setStep] = useState<'details' | 'modules'>('details');
    const [courseId, setCourseId] = useState<string | null>(null);

    const handleCourseCreated = (course: any) => {
        setCourseId(course._id);
        setStep('modules');
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 -ml-2 font-bold transition-all"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspace
                        </Button>
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                                <Sparkles className="w-3 h-3" /> Course Architect
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Build Knowledge</h1>
                            <p className="text-slate-500 font-medium">
                                Create a structured learning experience for your students.
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                            step === 'details' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400"
                        )}>
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                step === 'details' ? "bg-white/20 border-white/30" : "bg-slate-50 border-slate-100")}>
                                1
                            </div>
                            <span className="text-sm font-bold truncate">Course Basics</span>
                        </div>
                        <div className="w-4 h-px bg-slate-100 mx-1" />
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                            step === 'modules' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400"
                        )}>
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                step === 'modules' ? "bg-white/20 border-white/30" : "bg-slate-50 border-slate-100")}>
                                2
                            </div>
                            <span className="text-sm font-bold truncate">Curriculum</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-[32px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {step === 'details' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CourseForm onSuccess={handleCourseCreated} />
                        </div>
                    )}

                    {step === 'modules' && courseId && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ModuleManager courseId={courseId} onComplete={handleFinish} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
