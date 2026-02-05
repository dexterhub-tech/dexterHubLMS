'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';

interface Lesson {
    _id: string;
    name: string;
    duration: number;
    videoUrl?: string;
    assignment?: { title: string };
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
    completedLessonIds?: string[]; // For checking off items
}

export function CurriculumView({ modules, activeLessonId, onSelectLesson, completedLessonIds = [] }: CurriculumViewProps) {
    return (
        <div className="w-full h-full overflow-y-auto bg-white border-r border-slate-200">
            <div className="px-6 py-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">Curriculum</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} sessions total
                </p>
            </div>
            <div className="py-2">
                <Accordion type="single" collapsible className="w-full" defaultValue={modules[0]?._id}>
                    {modules.map((module, idx) => (
                        <AccordionItem key={module._id} value={module._id} className="border-b-0 px-2 mb-2">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="flex flex-col items-start gap-1 text-left">
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                        {idx + 1}. {module.name}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                                        {module.lessons?.length || 0} Sessions
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-2">
                                <div className="flex flex-col gap-1 pl-2">
                                    {module.lessons?.map((lesson) => {
                                        const isActive = activeLessonId === lesson._id;
                                        const isCompleted = completedLessonIds.includes(lesson._id);

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
                                                            <div className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-100">
                                                                <FileText className="w-3 h-3" />
                                                                <span>Task</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
