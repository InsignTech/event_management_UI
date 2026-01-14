"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { CalendarDays, MapPin, Clock, Mic2, Tv } from 'lucide-react';

interface Program {
    _id: string;
    name: string;
    type: 'single' | 'group';
    category: 'on_stage' | 'off_stage';
    venue: string;
    startTime: string;
    duration: number;
    event: {
        name: string;
    };
}

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await api.get('/public/schedule');
                if (res.data.success) {
                    setSchedule(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }, []);

    // Group by Date
    const groupedPrograms = schedule.reduce((acc: any, program) => {
        const date = new Date(program.startTime).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(program);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Event <span className="text-primary italic">Schedule</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Track all programs, venues, and timings across the MES Youth Fest. Real-time updates as events progress.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : Object.keys(groupedPrograms).length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                        <p className="text-muted-foreground">No programs scheduled yet.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedPrograms).map(([date, programs]: [string, any]) => (
                            <div key={date} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-primary">{date}</h2>
                                    <div className="h-px bg-primary/20 flex-1"></div>
                                </div>
                                
                                <div className="space-y-4 relative before:absolute before:left-[31px] md:before:left-[39px] before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                                    {programs.map((program: Program) => (
                                        <div key={program._id} className="relative pl-16 md:pl-24 group">
                                            {/* Timeline Dot */}
                                            <div className="absolute left-[24px] md:left-[32px] top-4 w-4 h-4 rounded-full border-2 border-background bg-primary group-hover:scale-125 transition-transform z-10 shadow-[0_0_0_4px_rgba(var(--primary),0.1)]"></div>
                                            
                                            <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 text-xs font-black uppercase tracking-wider text-muted-foreground/60">
                                                        <Clock className="h-3 w-3 text-primary" />
                                                        <span>
                                                            {new Date(program.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="mx-2 opacity-30">|</span>
                                                            {program.duration} mins
                                                        </span>
                                                    </div>
                                                    
                                                    <h3 className="text-lg md:text-xl font-bold mb-2 truncate group-hover:text-primary transition-colors">{program.name}</h3>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-primary" />
                                                            <span className="truncate max-w-[150px] md:max-w-none">{program.venue}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                        program.category === 'on_stage' 
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                            : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                    }`}>
                                                        {program.category.replace('_', '-')}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                        program.type === 'single' 
                                                            ? 'bg-muted text-muted-foreground border-border' 
                                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                        {program.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
