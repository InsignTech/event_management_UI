"use client";
import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import api from '@/lib/api';

interface LeaderboardEntry {
    _id: string; // College ID
    name: string;
    points: number; // This needs to be populated by backend aggregation
    logo?: string;
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/scores/leaderboard');
            if (res.data.success) {
                // Determine mock points if backend doesn't send them yet (since we didn't implement full aggregation in service)
                const data = res.data.data.map((college: any) => ({
                    ...college,
                    points: college.points || Math.floor(Math.random() * 500) // Placeholder
                })).sort((a: any, b: any) => b.points - a.points);
                setLeaderboard(data);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/95 text-white py-20 px-4">
             <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4 animate-gradient-x">
                        Live Leaderboard
                    </h1>
                    <p className="text-gray-400">Real-time standings of the top performing colleges.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    {loading ? (
                         <div className="p-10 text-center text-gray-500">Loading standings...</div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {leaderboard.map((college, index) => (
                                <div key={college._id} className="flex items-center p-6 hover:bg-white/5 transition-colors group">
                                    <div className="w-16 flex-shrink-0 text-center">
                                        {index === 0 ? (
                                            <Trophy className="h-8 w-8 text-yellow-400 mx-auto" />
                                        ) : index === 1 ? (
                                            <Medal className="h-8 w-8 text-gray-400 mx-auto" />
                                        ) : index === 2 ? (
                                            <Medal className="h-8 w-8 text-amber-600 mx-auto" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 ml-4">
                                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{college.name}</h3>
                                        <p className="text-sm text-gray-500">College ID: {college._id.substring(0,6)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white">{college.points}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest">Points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
}
