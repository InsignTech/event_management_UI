"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Trophy, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';

interface EventItem {
    id: number;
    time: string;
    title: string;
    category: 'ceremony' | 'dance' | 'music' | 'theatre' | 'literary';
    location: string;
    day: 1 | 2;
}

const SCHEDULE_DATA: EventItem[] = [
    { id: 1, day: 1, time: "09:00 AM", title: "Inaugural Ceremony", category: 'ceremony', location: "Main Auditorium" },
    { id: 2, day: 1, time: "10:30 AM", title: "Thiruvathira", category: 'dance', location: "Stage 1" },
    { id: 3, day: 1, time: "11:00 AM", title: "Mappilappattu (Male)", category: 'music', location: "Stage 2" },
    { id: 4, day: 1, time: "02:00 PM", title: "Oppana", category: 'dance', location: "Main Auditorium" },
    { id: 5, day: 1, time: "04:00 PM", title: "Mono Act", category: 'theatre', location: "Stage 3" },
    { id: 6, day: 2, time: "09:00 AM", title: "Group Song", category: 'music', location: "Main Auditorium" },
    { id: 7, day: 2, time: "11:00 AM", title: "Kolkali", category: 'dance', location: "Ground" },
    { id: 8, day: 2, time: "02:00 PM", title: "Duffmuttu", category: 'dance', location: "Stage 2" },
    { id: 9, day: 2, time: "05:00 PM", title: "Closing Ceremony", category: 'ceremony', location: "Main Auditorium" },
];

const CategoryBadge = ({ category }: { category: string }) => {
    const styles = {
        ceremony: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        dance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        music: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        theatre: "bg-pink-500/10 text-pink-400 border-pink-500/20",
        literary: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", styles[category as keyof typeof styles] || styles.ceremony)}>
            {category}
        </span>
    );
};

export default function Home() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const filteredEvents = SCHEDULE_DATA.filter(e => e.day === activeDay);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-primary/30">
        <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-[1]" />
        
        {/* Navigation removed to avoid duplication with global layout */}

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
            {/* Main Background Image - visible on desktop */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/hero-bg.png" 
                    alt="Space Background" 
                    fill 
                    className="object-cover object-center hidden md:block opacity-90"
                    priority
                />
                <Image 
                    src="/hero-bg-mobile.png" 
                    alt="Space Background" 
                    fill 
                    className="object-cover object-center md:hidden opacity-90"
                    priority
                />
                
                {/* Fallback gradients if image fails or for overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/50 to-[#020617] mix-blend-multiply" />
            </div>

            {/* Ambient Colors (preserved from previous design) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 blur-[130px] rounded-full -z-10 animate-pulse mix-blend-screen" />

            <div className="container px-4 text-center z-10 space-y-6">
                
                {/* 60th Anniversary Logo */}
                <div className="relative w-48 h-48 mx-auto mb-4 animate-fade-in-down">
                    <Image 
                        src="/60-logo.png" 
                        alt="Diamond Jubilee 60 Years" 
                        fill 
                        className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        priority
                    />
                </div>

                 {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary animate-fade-in-up backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Live Event Updates
                </div> */}
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl">
                    CELEBRATING <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">CULTURE</span> & 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300"> CREATIVITY</span>
                </h1>
                
                <div className="max-w-2xl mx-auto text-base md:text-xl text-slate-400 leading-relaxed font-light flex flex-col items-center gap-4">
                    <p className="px-4">
                        The biggest inter-college art fest is back. Conducted by <strong className="text-yellow-400 font-bold">MES Youth Wing Kerala</strong>. 
                        Join us for 2 days of spectacular performances and fierce competition.
                    </p>
                    {/* Youth Fest Logo - Responsive sizing */}
                    <div className="relative w-64 md:w-80 h-24 md:h-32 mt-4">
                        <Image 
                             src="/youth-fest-logo.png" 
                             alt="Youth Fest Logo" 
                             fill 
                             className="object-contain opacity-90" 
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-32 w-full max-w-sm sm:max-w-none mx-auto px-4">
                    <Link href="#schedule" className="group relative w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                        View Schedule
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/leaderboard" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Check Standings
                    </Link>
                </div>
            </div>
            
             {/* Stats Strip */}
             <div className="relative md:absolute bottom-0 w-full border-t border-white/5 bg-[#020617]/95 backdrop-blur-sm z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                    {[
                        { label: "Colleges", value: "50+" },
                        { label: "Participants", value: "2000+" },
                        { label: "Events", value: "85+" },
                        { label: "Prize Pool", value: "₹2L+" },
                    ].map((stat) => (
                        <div key={stat.label} className="py-8 text-center">
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        {/* Schedule Section */}
        <section id="schedule" className="py-24 relative overflow-hidden min-h-screen">
             {/* Zoomed Background for bottom section */}
             <div className="absolute inset-0 z-0 pointer-events-none">
                <Image 
                    src="/hero-bg.png" 
                    alt="Background Pattern" 
                    fill 
                    className="object-cover object-center opacity-50 scale-125 selection:blur-none"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]/90" />
             </div>

             <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Event <span className="text-primary">Schedule</span></h2>
                    <p className="text-slate-400">Detailed roadmap of the 2-day championship.</p>
                </div>

                {/* Day Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white/5 p-1.5 rounded-2xl inline-flex border border-white/10">
                        <button 
                            onClick={() => setActiveDay(1)}
                            className={cn(
                                "px-8 py-3 rounded-xl text-sm font-bold transition-all",
                                activeDay === 1 ? "bg-primary text-white shadow-lg shadow-orange-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Day 01 <span className="block text-[10px] font-normal opacity-70">Jan 15</span>
                        </button>
                        <button 
                            onClick={() => setActiveDay(2)}
                            className={cn(
                                "px-8 py-3 rounded-xl text-sm font-bold transition-all",
                                activeDay === 2 ? "bg-primary text-white shadow-lg shadow-orange-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            Day 02 <span className="block text-[10px] font-normal opacity-70">Jan 16</span>
                        </button>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Center Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:-translate-x-1/2" />

                    <div className="space-y-8">
                        {filteredEvents.map((event, index) => (
                            <div key={event.id} className={cn("relative flex items-center md:justify-between", 
                                index % 2 === 0 ? "md:flex-row-reverse" : ""
                            )}>
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[#020617] border-4 border-primary z-10 -translate-x-1.5 md:-translate-x-1/2 shadow-[0_0_15px_rgba(249,115,22,0.5)]" />

                                {/* Content Card */}
                                <div className={cn("ml-12 md:ml-0 w-full md:w-[45%]", 
                                    index % 2 === 0 ? "text-left" : "md:text-right"
                                )}>
                                    <div className={cn("group p-6 rounded-2xl bg-[#0b101e] border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 block relative overflow-hidden",
                                        index % 2 === 0 ? "origin-left" : "origin-right"
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className={cn("flex items-center gap-3 mb-4", 
                                            index % 2 !== 0 ? "md:justify-end" : ""
                                        )}>
                                            <CategoryBadge category={event.category} />
                                             <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-black/20 px-2 py-1 rounded-md">
                                                <Clock className="w-3 h-3" />
                                                {event.time}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                                        
                                        <div className={cn("flex items-center gap-2 text-sm text-slate-400",
                                             index % 2 !== 0 ? "md:justify-end" : ""
                                        )}>
                                            <MapPin className="w-4 h-4 text-primary/70" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/10 text-center text-slate-400 text-sm relative z-10 bg-[#020617]/80 backdrop-blur-md">
            <p>&copy; 2026 MES Youth Fest. Built with passion & creativity.</p>
        </footer>
    </div>
  );
}

