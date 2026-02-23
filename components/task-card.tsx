'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical } from 'lucide-react';

interface TaskCardProps {
    title: string;
    subject: string;
    instructor: string;
    type: 'Task' | 'Theory' | 'Assignment';
    status: 'pending' | 'completed' | 'submitted' | 'overdue';
    color: 'mint' | 'peach' | 'lavender' | 'yellow';
    onToggle?: () => void;
    onAction?: () => void;
}

const colorClasses = {
    mint: 'bg-[var(--course-mint)]',
    peach: 'bg-[var(--course-peach)]',
    lavender: 'bg-[var(--course-lavender)]',
    yellow: 'bg-[var(--course-yellow)]',
};

export function TaskCard({
    title,
    subject,
    instructor,
    type,
    status,
    color,
    onToggle,
    onAction,
}: TaskCardProps) {
    return (
        <div className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <div className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-transform group-hover:rotate-3",
                color && colorClasses[color as keyof typeof colorClasses]
            )}>
                <span className="text-xl md:text-2xl">📄</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        type === 'Task' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            type === 'Theory' ? "bg-purple-50 text-purple-600 border-purple-100" :
                                "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                        {type}
                    </span>
                    {(status === 'completed' || status === 'submitted') && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white border-slate-900">
                            {status === 'submitted' ? 'Submitted' : 'Done'}
                        </span>
                    )}
                </div>
                <h4 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{title}</h4>
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                    {subject} • {instructor}
                </p>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                {status === 'pending' ? (
                    onAction ? (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction();
                            }}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 rounded-xl font-bold hidden sm:flex"
                        >
                            Open Task
                        </Button>
                    ) : (
                        <div className="hidden sm:block">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 rounded-xl font-bold border-slate-200 text-slate-600"
                            >
                                View
                            </Button>
                        </div>
                    )
                ) : null}

                <div className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <MoreVertical className="w-5 h-5" />
                </div>
            </div>
        </div>
    );
}
