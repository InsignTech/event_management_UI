"use client";
import React, { useEffect, useState } from 'react';
import { Trophy, Search, Star, UserCheck } from 'lucide-react';
import api from '@/lib/api';

interface Registration {
    _id: string;
    chestNumber: string;
    participants: { universityRegNo: string }[];
    program: { name: string, type: string };
    pointsObtained: number;
    rank: number;
}

export default function ScoringPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            // This endpoint might need to be created or modified to get all results
            const res = await api.get('/registrations'); 
            if (res.data.success) {
                setRegistrations(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch results', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = registrations.filter(r => 
        r.program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.chestNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Scoring & Results</h1>
            
            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search by Program or Chest No..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Chest No</th>
                                <th className="px-6 py-3">Program</th>
                                <th className="px-6 py-3">Participants</th>
                                <th className="px-6 py-3">Rank</th>
                                <th className="px-6 py-3">Points</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading results...</td></tr>
                            ) : filteredResults.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No results found.</td></tr>
                            ) : (
                                filteredResults.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold">{reg.chestNumber}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold">{reg.program.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{reg.program.type}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                {reg.participants.map((p, i) => (
                                                    <span key={i} className="text-xs">{p.universityRegNo}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {reg.rank ? (
                                                <span className={`flex items-center gap-1 font-bold ${
                                                    reg.rank === 1 ? 'text-yellow-500' : 
                                                    reg.rank === 2 ? 'text-slate-400' : 
                                                    reg.rank === 3 ? 'text-amber-700' : ''
                                                }`}>
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {reg.rank}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold">{reg.pointsObtained || 0}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-primary hover:underline text-xs font-bold">Edit Score</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
