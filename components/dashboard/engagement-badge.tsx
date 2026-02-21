'use client';

import { cn } from '@/lib/utils';
import { Target, TrendingUp, ZapOff } from 'lucide-react';

interface EngagementBadgeProps {
    status: 'Active' | 'Growing' | 'Inactive';
    className?: string;
}

export function EngagementBadge({ status, className }: EngagementBadgeProps) {
    const configs = {
        Active: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: Target,
            label: 'Active'
        },
        Growing: {
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            icon: TrendingUp,
            label: 'Growing'
        },
        Inactive: {
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: ZapOff,
            label: 'Inactive'
        }
    };

    const config = configs[status] || configs.Inactive;
    const Icon = config.icon;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider font-bold",
            config.color,
            className
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </div>
    );
}
