"use client";
import React, { useEffect, useState } from 'react';
import { School, CalendarDays, Users, Trophy, UserCheck, MapPin, Mic2 } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import api from '@/lib/api';

interface DashboardData {
    stats: {
        totalColleges: number;
        totalPrograms: number;
        totalStudents: number;
        totalRegistrations: number;
    };
    recentRegistrations: any[];
    eventStatus: {
        counts: { upcoming: number; ongoing: number; completed: number };
        activeEvents: any[];
    };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const res = await api.get('/dashboard/overview');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err: any) {
                console.error('Failed to fetch dashboard data', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-bold">
                    Overview of MES Youth Fest
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Colleges" value={data.stats.totalColleges.toString()} icon={School} />
                <StatsCard title="Total Programs" value={data.stats.totalPrograms.toString()} icon={Mic2} />
                <StatsCard title="Total Students" value={data.stats.totalStudents.toString()} icon={Users} />
                <StatsCard title="Total Registrations" value={data.stats.totalRegistrations.toString()} icon={Trophy} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Recent Activity */}
                 <div className="p-6 rounded-xl bg-card border border-border min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Recent Registrations</h3>
                        <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="space-y-4">
                        {data.recentRegistrations.length === 0 ? (
                            <div className="text-muted-foreground text-sm text-center py-10">No recent registrations found</div>
                        ) : (
                            data.recentRegistrations.map((reg, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                    <div>
                                        <p className="font-bold text-sm">
                                            {reg.participants?.[0]?.name || 'Unknown Student'}
                                        </p>
                                        <p className="text-xs text-muted-foreground uppercase">{reg.program?.name || 'Unknown Program'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono font-bold text-primary">{reg.chestNumber}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {new Date(reg.registeredAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>

                 {/* Event Status */}
                 <div className="p-6 rounded-xl bg-card border border-border min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Ongoing Events</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Live Now</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.eventStatus.activeEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-muted-foreground text-sm">No active events at the moment</p>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Check upcoming schedule</p>
                            </div>
                        ) : (
                            data.eventStatus.activeEvents.map((event, idx) => (
                                <div key={idx} className="flex flex-col gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-foreground underline decoration-primary/30">{event.name}</h4>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">Active</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {event.venue}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3" />
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
}
