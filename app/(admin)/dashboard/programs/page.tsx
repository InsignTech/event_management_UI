"use client";
import React, { useEffect, useState } from 'react';
import { Search, Mic2, Tv, Calendar } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Program {
    _id: string;
    name: string;
    type: 'single' | 'group';
    category: 'on_stage' | 'off_stage';
    venue: string;
    startTime: string;
    event: { name: string, _id: string };
}

export default function AllProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllPrograms();
    }, []);

    const fetchAllPrograms = async () => {
        try {
            const res = await api.get('/programs'); // Assuming backend has an endpoint to get all programs
            if (res.data.success) {
                setPrograms(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch programs', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPrograms = programs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.event?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">All Programs</h1>

            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search by Program or Event..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading programs...</p>
                ) : filteredPrograms.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">No programs found.</p>
                ) : (
                    filteredPrograms.map((program) => (
                        <div key={program._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    {program.category === 'on_stage' ? <Mic2 className="h-6 w-6" /> : <Tv className="h-6 w-6" />}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                        program.type === 'single' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    }`}>
                                        {program.type}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{program.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-primary mb-4">
                                <Calendar className="h-3 w-3" />
                                <span>{program.event?.name}</span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">{program.venue}</p>
                            <div className="flex gap-2 pt-4 border-t border-border">
                                <Link 
                                    href={`/dashboard/events/${program.event?._id}/programs`}
                                    className="flex-1 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-center"
                                >
                                    Manage
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
