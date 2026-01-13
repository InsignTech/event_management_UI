"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Search, Star, UserCheck, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Registration {
    _id: string;
    chestNumber: string;
    participants: { universityRegNo: string }[];
    program: { _id: string, name: string, type: string };
    pointsObtained: number;
    rank: number;
}

interface Program {
    _id: string;
    name: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export default function ScoringPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(false);
    const [progLoading, setProgLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<string>('none');
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (selectedProgram !== 'none') {
            fetchRegistrations(page, debouncedSearch);
        } else {
            setRegistrations([]);
            setPagination(null);
        }
    }, [selectedProgram, page, debouncedSearch]);

    const fetchPrograms = async () => {
        try {
            setProgLoading(true);
            const res = await api.get('/programs');
            if (res.data.success) {
                setPrograms(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch programs', error);
        } finally {
            setProgLoading(false);
        }
    };

    const fetchRegistrations = async (pageNum: number, searchStr: string = '') => {
        try {
            setLoading(true);
            const res = await api.get(`/registrations/program/${selectedProgram}?page=${pageNum}&limit=20&search=${searchStr}`);
            if (res.data.success) {
                setRegistrations(res.data.registrations);
                setPagination(res.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch registrations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProgram(e.target.value);
        setPage(1);
        setSearchTerm(''); // Optional: clear search on program change
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Scoring & Results</h1>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg w-full max-w-md">
                    <Search className="h-4 w-4 text-muted-foreground mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search by Chest No or Reg No..." 
                        className="bg-transparent border-none outline-none text-sm w-full"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={selectedProgram === 'none'}
                    />
                </div>

                <div className="flex items-center px-3 py-2 bg-card border border-border rounded-lg w-full md:w-64">
                    <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                    <select 
                        className="bg-transparent border-none outline-none text-sm w-full cursor-pointer text-foreground appearance-none focus:ring-0"
                        value={selectedProgram}
                        onChange={handleProgramChange}
                        disabled={progLoading}
                    >
                        <option value="none" className="bg-card text-foreground">Select a Program</option>
                        {programs.map(prog => (
                            <option key={prog._id} value={prog._id} className="bg-card text-foreground">
                                {prog.name}
                            </option>
                        ))}
                    </select>
                </div>
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
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {progLoading || loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
                            ) : selectedProgram === 'none' ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Please select a program to view results.</td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No results found for this program.</td></tr>
                            ) : (
                                registrations.map((reg) => (
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
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary hover:underline text-xs font-bold">Edit Score</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-medium">Page {page} of {pagination.pages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
