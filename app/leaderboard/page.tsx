"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Trophy, Medal, Award } from 'lucide-react';
import Image from 'next/image';

interface CollegeStanding {
    name: string;
    logo?: string;
    points: number;
    rank: number;
}

export default function LeaderboardPage() {
    const [standings, setStandings] = useState<CollegeStanding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/public/leaderboard');
                if (res.data.success) {
                    setStandings(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const topThree = standings.slice(0, 3);
    const others = standings.slice(3);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                        Points <span className="text-primary italic">Table</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Real-time college standings based on program results.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : standings.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-3xl">
                        <p className="text-muted-foreground">No points recorded yet. Stay tuned!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Top 3 Podium */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pb-12 border-b border-border/50">
                            {/* 2nd Place */}
                            {topThree[1] && (
                                <div className="order-2 md:order-1 flex flex-col items-center">
                                    <div className="mb-4 relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-slate-300 bg-card overflow-hidden flex items-center justify-center p-4">
                                            {topThree[1].logo ? (
                                                <Image src={topThree[1].logo} alt={topThree[1].name} width={80} height={80} className="object-contain" />
                                            ) : (
                                                <Trophy className="h-10 w-10 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-black">{topThree[1].rank}</div>
                                    </div>
                                    <h3 className="text-xl font-black text-center mb-1">{topThree[1].name}</h3>
                                    <p className="text-primary font-black text-2xl">{topThree[1].points} <span className="text-xs uppercase opacity-60">PTS</span></p>
                                </div>
                            )}

                            {/* 1st Place */}
                            {topThree[0] && (
                                <div className="order-1 md:order-2 flex flex-col items-center scale-110 mb-8 md:mb-0">
                                    <div className="mb-4 relative">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                            <Trophy className="h-12 w-12 text-yellow-500" />
                                        </div>
                                        <div className="w-32 h-32 rounded-full border-4 border-yellow-500 bg-card overflow-hidden flex items-center justify-center p-6 shadow-2xl shadow-yellow-500/20">
                                            {topThree[0].logo ? (
                                                <Image src={topThree[0].logo} alt={topThree[0].name} width={100} height={100} className="object-contain" />
                                            ) : (
                                                <Trophy className="h-12 w-12 text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-yellow-950 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">{topThree[0].rank}</div>
                                    </div>
                                    <h3 className="text-2xl font-black text-center mb-1">{topThree[0].name}</h3>
                                    <p className="text-primary font-black text-3xl">{topThree[0].points} <span className="text-xs uppercase opacity-60">PTS</span></p>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {topThree[2] && (
                                <div className="order-3 md:order-3 flex flex-col items-center">
                                    <div className="mb-4 relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-amber-700 bg-card overflow-hidden flex items-center justify-center p-4">
                                            {topThree[2].logo ? (
                                                <Image src={topThree[2].logo} alt={topThree[2].name} width={80} height={80} className="object-contain" />
                                            ) : (
                                                <Trophy className="h-10 w-10 text-amber-700" />
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-amber-700 text-amber-100 w-8 h-8 rounded-full flex items-center justify-center font-black">{topThree[2].rank}</div>
                                    </div>
                                    <h3 className="text-xl font-black text-center mb-1">{topThree[2].name}</h3>
                                    <p className="text-primary font-black text-2xl">{topThree[2].points} <span className="text-xs uppercase opacity-60">PTS</span></p>
                                </div>
                            )}
                        </div>

                        {/* List View for Others */}
                        <div className="space-y-4">
                            {others.map((college, index) => (
                                <div key={college.name} className="flex items-center justify-between p-6 bg-card border border-border/50 rounded-2xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-black opacity-20 w-8">{college.rank}</span>
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden p-2">
                                            {college.logo ? (
                                                <Image src={college.logo} alt={college.name} width={40} height={40} className="object-contain" />
                                            ) : (
                                                <Award className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <h4 className="font-bold text-lg">{college.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-primary">{college.points}</span>
                                        <span className="block text-[10px] uppercase font-bold opacity-50 tracking-widest">Points</span>
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
