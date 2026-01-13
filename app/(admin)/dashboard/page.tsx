import React from 'react';
import { School, CalendarDays, Users, Trophy } from 'lucide-react';
import StatsCard from '@/components/StatsCard';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="text-sm text-muted-foreground">
                    Overview of MES Youth Fest
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Colleges" value="12" icon={School} change="+2" />
                <StatsCard title="Active Events" value="8" icon={CalendarDays} change="+1" />
                <StatsCard title="Total Students" value="1,240" icon={Users} change="+15%" />
                <StatsCard title="Avg Score" value="85.4" icon={Trophy} change="+4.2%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Placeholder for Recent Activity or Charts */}
                 <div className="p-6 rounded-xl bg-card border border-border min-h-[300px]">
                    <h3 className="text-lg font-bold mb-4">Recent Registrations</h3>
                    <div className="text-muted-foreground text-sm">No recent data</div>
                 </div>
                 <div className="p-6 rounded-xl bg-card border border-border min-h-[300px]">
                    <h3 className="text-lg font-bold mb-4">Event Status</h3>
                    <div className="text-muted-foreground text-sm">No active events</div>
                 </div>
            </div>
        </div>
    );
}
