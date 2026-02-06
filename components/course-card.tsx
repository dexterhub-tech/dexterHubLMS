'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Clock,
    User,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
    title: string;
    subtitle?: string;
    icon?: string;
    progress?: number;
    duration?: string;
    instructor?: string;
    registrarsCount?: number;
    color?: 'mint' | 'peach' | 'lavender' | 'yellow' | string;
    onClick?: () => void;
}

export function CourseCard({
    title,
    subtitle,
    icon = '📚',
    progress = 0,
    duration = 'N/A',
    instructor = 'Instructor',
    registrarsCount,
    color = 'lavender',
    onClick
}: CourseCardProps) {

    const colorClasses: Record<string, string> = {
        mint: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        peach: 'bg-orange-50 text-orange-600 border-orange-100',
        lavender: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        yellow: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    const colorClass = colorClasses[color] || 'bg-slate-50 text-slate-600 border-slate-100';

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-[32px] p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
            {/* Background Accent */}
            <div className={cn(
                "absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700",
                colorClass.split(' ')[0]
            )} />

            <div className="relative z-10 space-y-4">
                {/* Header: Icon & Progress Badge */}
                <div className="flex justify-between items-start">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-transform group-hover:rotate-6",
                        colorClass
                    )}>
                        {icon}
                    </div>
                    {progress > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-emerald-100">
                            <TrendingUp className="w-3 h-3" />
                            {progress}%
                        </div>
                    )}
                </div>

                {/* Content */}
                <div>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-50 w-full" />

                {/* Footer Meta */}
                <div className="flex items-center justify-between text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:gap-4">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[80px] md:max-w-none">{instructor}</span>
                        </div>
                        {registrarsCount !== undefined && (
                            <div className="flex items-center gap-1.5 text-indigo-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {registrarsCount}
                            </div>
                        )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-600">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>

                {/* Progress Bar (at very bottom) */}
                {progress > 0 && (
                    <div className="pt-2">
                        <Progress value={progress} className="h-1.5 bg-slate-100" />
                    </div>
                )}
            </div>
        </div>
    );
}
