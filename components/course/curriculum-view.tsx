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
    userId?: string;
}

/**
 * Determines which modules are "completed" based on completed lesson IDs.
 * A module is complete if every lesson that has an assignment has been completed.
 * If a module has no assignments, it's treated as complete.
 */
function getModuleCompletionStatus(modules: Module[], completedLessonIds: string[], userId?: string): boolean[] {
    return modules.map(module => {
        const assignmentLessons = (module.lessons || []).filter(l => !!l.assignment?.title);
        if (assignmentLessons.length === 0) return true; // No assignments => consider complete
        return assignmentLessons.every(l =>
            completedLessonIds.includes(l._id) ||
            l.assignment?.passingLearners?.some((id: any) => id.toString() === userId)
        );
    });
}

export function CurriculumView({ modules, activeLessonId, onSelectLesson, completedLessonIds = [], userId }: CurriculumViewProps) {
    const moduleCompletionStatus = getModuleCompletionStatus(modules, completedLessonIds, userId);

    return (
        <div className="w-full h-full overflow-y-auto bg-white border-r border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                <h3 className="font-semibold text-lg text-slate-800 tracking-tight">Curriculum</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} sessions total
                </p>
            </div>
            <div className="py-2">
                <Accordion type="single" collapsible className="w-full" defaultValue={modules[0]?._id}>
                    {modules.map((module, idx) => {
                        // A module is locked if it's not the first AND the previous module is not completed
                        const isModuleLocked = idx > 0 && !moduleCompletionStatus[idx - 1];

                        return (
                            <AccordionItem key={module._id} value={module._id} className="border-b-0 px-2 mb-2">
                                <AccordionTrigger
                                    className={cn(
                                        "px-4 py-3 hover:no-underline rounded-lg transition-colors group",
                                        isModuleLocked
                                            ? "text-slate-400 cursor-default hover:bg-transparent"
                                            : "hover:bg-slate-50"
                                    )}
                                    disabled={isModuleLocked}
                                >
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <div className="flex items-center gap-2">
                                            {isModuleLocked && <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                                            <span className={cn(
                                                "text-sm font-semibold transition-colors",
                                                isModuleLocked ? "text-slate-400" : "text-slate-700 group-hover:text-slate-900"
                                            )}>
                                                {idx + 1}. {module.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                                            {isModuleLocked ? 'Locked · ' : ''}{module.lessons?.length || 0} Sessions
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                {!isModuleLocked && (
                                    <AccordionContent className="pt-1 pb-2">
                                        <div className="flex flex-col gap-1 pl-2">
                                            {module.lessons?.map((lesson) => {
                                                const isActive = activeLessonId === lesson._id;
                                                const isCompleted =
                                                    completedLessonIds.includes(lesson._id) ||
                                                    lesson.assignment?.passingLearners?.some((id: any) => id.toString() === userId);

                                                return (
                                                    <button
                                                        key={lesson._id}
                                                        onClick={() => onSelectLesson(lesson)}
                                                        className={cn(
                                                            "flex items-start gap-3 p-3 text-left rounded-lg transition-all duration-200",
                                                            isActive
                                                                ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                                                                : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                                        )}
                                                    >
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                            ) : lesson.videoUrl ? (
                                                                <PlayCircle className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                                            ) : (
                                                                <FileText className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={cn("text-sm font-medium truncate leading-tight", isActive ? "text-indigo-900" : "")}>
                                                                {lesson.name}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                                    {lesson.duration}m
                                                                </span>
                                                                {lesson.assignment?.title && (
                                                                    <div className={cn(
                                                                        "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm border",
                                                                        isCompleted
                                                                            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                                                            : "text-amber-600 bg-amber-50 border-amber-100"
                                                                    )}>
                                                                        {isCompleted ? (
                                                                            <>
                                                                                <CheckCircle className="w-3 h-3" />
                                                                                <span>PASSED</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FileText className="w-3 h-3" />
                                                                                <span>Task</span>
                                                                            </>
                                                                        )}
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
