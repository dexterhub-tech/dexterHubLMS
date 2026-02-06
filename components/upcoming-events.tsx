'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

interface UpcomingEvent {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    duration: string;
    type: 'exam' | 'assignment' | 'test';
    icon: string;
}

interface UpcomingEventsProps {
    events: UpcomingEvent[];
    onViewAll?: () => void;
}

const typeColors = {
    exam: 'bg-blue-100 text-blue-700',
    assignment: 'bg-yellow-100 text-yellow-700',
    test: 'bg-purple-100 text-purple-700',
};

export function UpcomingEvents({ events, onViewAll }: UpcomingEventsProps) {
    return (
        <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold text-lg text-foreground mb-4">Upcoming</h3>

            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl",
                            typeColors[event.type]
                        )}>
                            {event.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground truncate">
                                {event.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                                {event.subtitle}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="text-accent font-medium">{event.date}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {event.duration}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="ghost"
                className="w-full mt-4 text-accent hover:text-accent/90"
                onClick={onViewAll}
            >
                View all upcoming
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    );
}
