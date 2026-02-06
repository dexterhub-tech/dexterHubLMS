import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    iconColor?: string;
    iconBgColor?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export function StatCard({
    icon: Icon,
    label,
    value,
    iconColor = 'text-primary',
    iconBgColor = 'bg-primary/10',
    trend
}: StatCardProps) {
    return (
        <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className={cn(
                        "md:w-12 md:h-12 w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                        iconBgColor
                    )}>
                        <Icon className={cn("w-6 h-6", iconColor)} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                    <p className="md:text-3xl text-lg font-semibold text-slate-800 tracking-tight">{value}</p>
                    {trend && (
                        <p className={cn(
                            "text-sm mt-2 font-medium flex items-center gap-1",
                            trend.isPositive ? "text-emerald-600" : "text-rose-600"
                        )}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
