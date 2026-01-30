"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Trophy, Medal, Award, User, School, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface StudentRanking {
    rank: number;
    student: {
        _id: string;
        name: string;
        gender: string;
        college: {
            name: string;
            logo?: string;
        };
    };
    points: number;
    breakdown: {
        programName: string;
        rank: number;
        points: number;
    }[];
}

export default function StudentRankingPage() {
    const [rankings, setRankings] = useState<StudentRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [gender, setGender] = useState<'male' | 'female'>('male');

    useEffect(() => {
        document.title = `Student Ranking - ${gender.charAt(0).toUpperCase() + gender.slice(1)} | MES Youth Fest`;
        fetchRankings();
    }, [gender]);

    const fetchRankings = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/public/student-ranking?gender=${gender}`);
            if (res.data.success) {
                setRankings(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch rankings", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest italic">Individual Championship</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Student <span className="text-primary italic">Rankings</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        Live individual standings based on single program results. 
                        Points: 1st (5pts), 2nd (3pts), 3rd (1pt).
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-center justify-center mb-12 animate-in fade-in zoom-in duration-700 delay-500">
                    <div className="bg-muted p-1.5 rounded-2xl flex gap-1 border border-border/50 shadow-inner">
                        <button
                            onClick={() => setGender('male')}
                            className={cn(
                                "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                                gender === 'male' 
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <User className={cn("h-4 w-4", gender === 'male' ? "animate-pulse" : "")} />
                            Male
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={cn(
                                "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                                gender === 'female' 
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            <User className={cn("h-4 w-4", gender === 'female' ? "animate-pulse" : "")} />
                            Female
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Star className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                        </div>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">Calculating Ranks...</p>
                    </div>
                ) : rankings.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-border/10 rounded-[3rem] bg-card/30 backdrop-blur-sm">
                        <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold mb-2">No results yet</h3>
                        <p className="text-muted-foreground">The results for {gender} individual category are not yet published.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Table Header - Desktop Only */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-muted/30 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            <div className="col-span-1">Rank</div>
                            <div className="col-span-4">Student & College</div>
                            <div className="col-span-1">Gender</div>
                            <div className="col-span-1 text-center">Points</div>
                            <div className="col-span-5">Program Breakdown</div>
                        </div>

                        {/* Ranking Items */}
                        <div className="space-y-4">
                            {rankings.map((item, index) => (
                                <div 
                                    key={item.student._id} 
                                    className={cn(
                                        "group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 md:p-8 bg-[#030712] border border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5",
                                        item.rank === 1 && "md:scale-105 md:z-10 bg-gradient-to-br from-[#030712] to-primary/5 border-primary/20"
                                    )}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Background Decor for Rank 1 */}
                                    {item.rank === 1 && (
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Trophy className="h-24 w-24 text-primary" />
                                        </div>
                                    )}

                                    {/* Rank */}
                                    <div className="col-span-1 flex items-center justify-center md:justify-start">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-500",
                                            item.rank === 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : 
                                            item.rank === 2 ? "bg-slate-700 text-white" :
                                            item.rank === 3 ? "bg-amber-900 text-amber-100" :
                                            "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>
                                            {item.rank}
                                        </div>
                                    </div>

                                    {/* Student Info */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden p-2 group-hover:border-primary/50 transition-colors">
                                            {item.student.college?.logo ? (
                                                <Image src={item.student.college.logo} alt={item.student.college.name} width={40} height={40} className="object-contain" />
                                            ) : (
                                                <School className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-black text-lg md:text-xl text-slate-100 group-hover:text-primary transition-colors leading-tight">{item.student.name}</h4>
                                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tight">
                                                <School className="h-3 w-3" />
                                                {item.student.college?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="col-span-1 hidden md:flex">
                                        <span className="px-3 py-1 bg-muted/50 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {item.student.gender}
                                        </span>
                                    </div>

                                    {/* Points */}
                                    <div className="col-span-1 text-center py-4 md:py-0">
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">{item.points}</span>
                                            <span className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Points</span>
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="col-span-5 border-t border-white/5 md:border-t-0 pt-4 md:pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {item.breakdown.map((b, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-muted/30 hover:bg-muted/50 px-3 py-2 rounded-xl border border-white/5 transition-colors group/item">
                                                    <span className="text-[10px] font-bold text-slate-300 max-w-[150px] truncate">{b.programName}</span>
                                                    <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-lg text-[10px] font-black">
                                                        <Medal className="h-3 w-3" />
                                                        Rank {b.rank}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
