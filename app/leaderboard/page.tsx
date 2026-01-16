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

    // Logic for Podium vs List
    // 1. If no points yet, list everyone.
    // 2. If tie for 1st place (multiple rank 1s), list everyone (no podium).
    // 3. If unique 1st, show Gold.
    // 4. If unique 2nd, show Silver.
    // 5. If unique 3rd, show Bronze.
    
    let topThree: (CollegeStanding | null)[] = [null, null, null]; // [Silver, Gold, Bronze]

    const rank1 = standings.filter(s => s.rank === 1);
    const rank2 = standings.filter(s => s.rank === 2);
    const rank3 = standings.filter(s => s.rank === 3);
    
    // Only show podium if we have scores
    const showPodium = standings.length > 0 && standings[0].points > 0;
    
    let renderedInPodium: string[] = [];

    if (showPodium) {
        // Gold Logic: Only if unique Rank 1
        if (rank1.length === 1) {
            topThree[1] = rank1[0]; // Gold is center (index 1 in map below, but visual order 2)
            renderedInPodium.push(rank1[0].name);

            // Silver Logic: Only if unique Rank 2
            if (rank2.length === 1) {
                topThree[0] = rank2[0]; // Silver is left (visual order 1)
                renderedInPodium.push(rank2[0].name);

                // Bronze Logic: Only if unique Rank 3
                if (rank3.length === 1) {
                    topThree[2] = rank3[0]; // Bronze is right (visual order 3)
                    renderedInPodium.push(rank3[0].name);
                }
            }
        }
    }

    const others = standings.filter(s => !renderedInPodium.includes(s.name));

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
                        {/* Top 3 Podium - Only render if we have at least one item to show */}
                        {renderedInPodium.length > 0 && (
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-end pb-12 border-b border-white/10 isolate">
                                {/* Ambient Glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/20 blur-[100px] -z-10 rounded-full" />
                                
                                {/* 2nd Place (Silver) - Index 0 */}
                                <div className="order-2 md:order-1 flex flex-col items-center">
                                    {topThree[0] ? (
                                        <>
                                            <div className="mb-4 relative group">
                                                <div className="absolute inset-0 bg-slate-400/20 blur-xl rounded-full group-hover:bg-slate-400/30 transition-all duration-500" />
                                                <div className="relative w-24 h-24 rounded-full border-4 border-slate-300 bg-[#0f172a] overflow-hidden flex items-center justify-center p-4 shadow-2xl shadow-slate-500/10">
                                                    {topThree[0].logo ? (
                                                        <Image src={topThree[0].logo} alt={topThree[0].name} width={80} height={80} className="object-contain" />
                                                    ) : (
                                                        <Trophy className="h-10 w-10 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-[#0f172a]">{topThree[0].rank}</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <h3 className="text-xl font-black mb-1 line-clamp-1 text-slate-200">{topThree[0].name}</h3>
                                                <p className="text-slate-400 font-extrabold text-2xl">{topThree[0].points} <span className="text-xs uppercase font-bold text-slate-600">PTS</span></p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-24 hidden md:block" />
                                    )}
                                </div>

                                {/* 1st Place (Gold) - Index 1 */}
                                <div className="order-1 md:order-2 flex flex-col items-center scale-110 mb-8 md:mb-0">
                                   {topThree[1] && (
                                        <>
                                            <div className="mb-6 relative group">
                                                <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse" />
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                                                    <Trophy className="h-14 w-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                                                </div>
                                                <div className="relative w-32 h-32 rounded-full border-4 border-yellow-500 bg-[#0f172a] overflow-hidden flex items-center justify-center p-6 shadow-2xl shadow-yellow-500/20 ring-4 ring-yellow-500/10">
                                                    {topThree[1].logo ? (
                                                        <Image src={topThree[1].logo} alt={topThree[1].name} width={100} height={100} className="object-contain" />
                                                    ) : (
                                                        <Trophy className="h-12 w-12 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 text-yellow-950 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 border-[#0f172a] shadow-lg">{topThree[1].rank}</div>
                                            </div>
                                            <div className="text-center w-full px-2">
                                                <h3 className="text-2xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500">{topThree[1].name}</h3>
                                                <p className="text-primary font-black text-4xl drop-shadow-sm">{topThree[1].points} <span className="text-sm uppercase font-bold text-primary/50">PTS</span></p>
                                            </div>
                                        </>
                                   )}
                                </div>

                                {/* 3rd Place (Bronze) - Index 2 */}
                                <div className="order-3 md:order-3 flex flex-col items-center">
                                    {topThree[2] ? (
                                        <>
                                            <div className="mb-4 relative group">
                                                <div className="absolute inset-0 bg-amber-700/20 blur-xl rounded-full group-hover:bg-amber-700/30 transition-all duration-500" />
                                                <div className="relative w-24 h-24 rounded-full border-4 border-amber-700 bg-[#0f172a] overflow-hidden flex items-center justify-center p-4 shadow-2xl shadow-amber-900/20">
                                                    {topThree[2].logo ? (
                                                        <Image src={topThree[2].logo} alt={topThree[2].name} width={80} height={80} className="object-contain" />
                                                    ) : (
                                                        <Trophy className="h-10 w-10 text-amber-700" />
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100 w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-[#0f172a]">{topThree[2].rank}</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <h3 className="text-xl font-black mb-1 line-clamp-1 text-slate-200">{topThree[2].name}</h3>
                                                <p className="text-slate-400 font-extrabold text-2xl">{topThree[2].points} <span className="text-xs uppercase font-bold text-slate-600">PTS</span></p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-24 hidden md:block" />
                                    )}
                                </div>
                            </div>
                         )}

                        {/* List View for Others */}
                        <div className="space-y-4">
                            {others.map((college, index) => (
                                <div key={college.name} className="group relative flex items-center justify-between p-4 md:p-6 bg-[#030712] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="relative flex items-center gap-6">
                                        <span className="text-2xl font-black text-slate-700 w-8 group-hover:text-primary transition-colors">{college.rank}</span>
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden p-2 group-hover:border-primary/50 transition-colors">
                                            {college.logo ? (
                                                <Image src={college.logo} alt={college.name} width={40} height={40} className="object-contain" />
                                            ) : (
                                                <Award className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors" />
                                            )}
                                        </div>
                                        <h4 className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{college.name}</h4>
                                    </div>
                                    <div className="relative text-right">
                                        <span className="text-xl font-black text-primary">{college.points}</span>
                                        <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-widest">Points</span>
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
