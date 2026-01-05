import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    change?: string;
}

export default function StatsCard({ title, value, icon: Icon, change }: StatsCardProps) {
    return (
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-2">{value}</h3>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {change && (
                <div className="mt-4 flex items-center text-xs">
                    <span className="text-green-500 font-medium">{change}</span>
                    <span className="text-muted-foreground ml-2">from last month</span>
                </div>
            )}
        </div>
    );
}
