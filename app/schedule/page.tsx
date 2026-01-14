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
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {programs.map((program: Program) => (
                                        <div key={program._id} className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all group hover:shadow-2xl hover:shadow-primary/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    {program.category === 'on_stage' ? <Mic2 className="h-6 w-6" /> : <Tv className="h-6 w-6" />}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-primary/20 bg-primary/5 text-primary">
                                                        {program.event.name}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                        program.type === 'single' 
                                                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                        {program.type}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold mb-4 line-clamp-1">{program.name}</h3>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <span>{program.venue}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                    <span>
                                                        {new Date(program.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <span className="mx-2 opacity-30">|</span>
                                                        {program.duration} mins
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
