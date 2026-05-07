'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';

interface Lesson {
    _id: string;
    name: string;
    duration: number;
    videoUrl?: string;
    assignment?: {
        title: string;
        passingLearners?: string[];
    };
}

interface Module {
    _id: string;
    name: string;
    description: string;
    lessons: Lesson[];
}

interface CurriculumViewProps {
    modules: Module[];
    activeLessonId?: string;
    onSelectLesson: (lesson: any) => void;
    completedLessonIds?: string[];
    submissions?: any[];
    userId?: string;
}

export function CurriculumView({ modules, activeLessonId, onSelectLesson, completedLessonIds = [], submissions = [], userId }: CurriculumViewProps) {
    // Helper to check if a lesson is completed
    const isLessonCompleted = (lesson: Lesson) => {
        if (!lesson) return false;
        
        const lessonId = String(lesson._id);
        const hasSubmission = submissions.some(s => {
            const sLessonId = s.lessonId || s.relatedId;
            return sLessonId && String(sLessonId) === lessonId;
        });
        
        const submission = submissions.find(s => {
            const sLessonId = s.lessonId || s.relatedId;
            return sLessonId && String(sLessonId) === lessonId;
        });
        const isGraded = submission?.status === 'graded' || submission?.status === 'completed';
        
        // If it has an assignment, it's completed if submitted or passed
        if (lesson.assignment?.title) {
            return completedLessonIds.some(id => String(id) === lessonId) ||
                lesson.assignment?.passingLearners?.some((id: any) => String(id) === String(userId)) ||
                hasSubmission || isGraded;
        }
        
        // If no assignment, viewing it marks it as completed (recorded in completedLessonIds)
        return completedLessonIds.some(id => String(id) === lessonId);
    };

    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const completedCount = modules.flatMap(m => m.lessons).filter(l => isLessonCompleted(l)).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Calculate module completion status
    const moduleCompletionStatus = modules.map(module => {
        if (!module.lessons || module.lessons.length === 0) return true;
        return module.lessons.every(l => isLessonCompleted(l));
    });

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="px-5 py-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900 tracking-tight">Course Content</h3>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                        {completedCount}/{totalLessons} DONE
                    </span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-indigo-600">
                        <span>{progressPercentage}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercentage}%` }} 
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                <Accordion type="single" collapsible className="w-full" defaultValue={modules[0]?._id}>
                    {modules.map((module, mIdx) => {
                        const isModuleLocked = mIdx > 0 && !moduleCompletionStatus[mIdx - 1];
                        const moduleCompletedCount = (module.lessons || []).filter(l => isLessonCompleted(l)).length;
                        const moduleTotalCount = module.lessons?.length || 0;

                        return (
                            <AccordionItem key={module._id} value={module._id} className="border-b-0 px-3 mb-1">
                                <AccordionTrigger
                                    className={cn(
                                        "px-4 py-4 hover:no-underline rounded-xl transition-all group",
                                        isModuleLocked
                                            ? "text-slate-400 cursor-default hover:bg-transparent opacity-60"
                                            : "hover:bg-slate-50/80 data-[state=open]:bg-slate-50"
                                    )}
                                    disabled={isModuleLocked}
                                >
                                    <div className="flex flex-col items-start gap-1 text-left w-full">
                                        <div className="flex items-center justify-between w-full pr-2">
                                            <div className="flex items-center gap-2">
                                                {isModuleLocked ? (
                                                    <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                                                ) : moduleCompletedCount === moduleTotalCount ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                ) : null}
                                                <span className={cn(
                                                    "text-sm font-medium transition-colors",
                                                    isModuleLocked ? "text-slate-400" : "text-slate-800 group-hover:text-slate-900"
                                                )}>
                                                    Section {mIdx + 1}: {module.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase tracking-tighter font-medium text-slate-400">
                                                {moduleCompletedCount}/{moduleTotalCount} SESSIONS
                                            </span>
                                            {isModuleLocked && (
                                                <span className="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">LOCKED</span>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                {!isModuleLocked && (
                                    <AccordionContent className="pt-2 pb-3">
                                        <div className="flex flex-col gap-1.5 pl-1">
                                            {module.lessons?.map((lesson, lIdx) => {
                                                const isActive = activeLessonId === lesson._id;
                                                const lessonId = String(lesson._id);
                                                
                                                let isLessonLocked = false;
                                                if (lIdx > 0) {
                                                    isLessonLocked = !isLessonCompleted(module.lessons[lIdx - 1]);
                                                } else if (mIdx > 0) {
                                                    const prevModule = modules[mIdx - 1];
                                                    const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1];
                                                    isLessonLocked = !isLessonCompleted(lastLessonOfPrevModule);
                                                }

                                                const submission = submissions.find(s => {
                                                    const sLessonId = s.lessonId || s.relatedId;
                                                    return sLessonId && String(sLessonId) === lessonId;
                                                });
                                                
                                                const isSubmitted = !!submission;
                                                const isCompleted = isLessonCompleted(lesson);

                                                return (
                                                    <button
                                                        key={lessonId}
                                                        onClick={() => !isLessonLocked && onSelectLesson(lesson)}
                                                        disabled={isLessonLocked}
                                                        className={cn(
                                                            "flex items-start gap-4 p-3.5 text-left rounded-xl transition-all duration-300 w-full group/item relative",
                                                            isActive
                                                                ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200"
                                                                : isLessonLocked
                                                                    ? "opacity-40 cursor-not-allowed"
                                                                    : "hover:bg-slate-50/50 text-slate-600"
                                                        )}
                                                    >
                                                        {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full" />}
                                                        
                                                        <div className="mt-1 flex-shrink-0">
                                                            {isLessonLocked ? (
                                                                <Lock className="w-4 h-4 text-slate-300" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                                                            ) : isSubmitted ? (
                                                                <CheckCircle className="w-4 h-4 text-indigo-500 opacity-60" />
                                                            ) : lesson.videoUrl ? (
                                                                <PlayCircle className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                                            ) : (
                                                                <FileText className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn(
                                                                "text-sm font-medium truncate leading-tight transition-colors", 
                                                                isActive ? "text-slate-900" : isLessonLocked ? "text-slate-400" : "group-hover/item:text-slate-900"
                                                            )}>
                                                                {lesson.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                                                                    {lesson.videoUrl ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                                    <span>{lesson.duration}min</span>
                                                                </div>
                                                                {lesson.assignment?.title && (
                                                                    <div className={cn(
                                                                        "flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-sm border uppercase tracking-widest",
                                                                        isCompleted
                                                                            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                                            : isSubmitted
                                                                                ? "text-indigo-600 bg-indigo-50 border-indigo-100"
                                                                                : isLessonLocked 
                                                                                    ? "text-slate-300 bg-slate-50 border-slate-100"
                                                                                    : "text-amber-600 bg-amber-50 border-amber-100"
                                                                    )}>
                                                                        {isLessonLocked ? "Locked" : isCompleted ? "Passed" : isSubmitted ? "Done" : "Task"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                )}
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </div>
    );
}
