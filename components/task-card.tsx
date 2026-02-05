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
    status: 'pending' | 'completed' | 'overdue';
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
        <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                colorClasses[color]
            )}>
                <span className="text-2xl">📄</span>
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{title}</h4>
                <p className="text-sm text-muted-foreground">
                    {subject} • {instructor}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    type === 'Task' ? "bg-blue-100 text-blue-700" :
                        type === 'Theory' ? "bg-purple-100 text-purple-700" :
                            "bg-green-100 text-green-700"
                )}>
                    {type}
                </span>

                {status === 'pending' ? (
                    onAction && (
                        <Button
                            onClick={onAction}
                            size="sm"
                            className="bg-accent hover:bg-accent/90"
                        >
                            Add or Create
                        </Button>
                    )
                ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Mark as Done
                    </span>
                )}

                <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
