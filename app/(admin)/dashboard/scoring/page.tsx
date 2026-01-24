"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Trophy, Search, Star, UserCheck, Filter, ChevronLeft, ChevronRight, Share, CheckCircle, Lock, PlusCircle, Edit3 } from 'lucide-react';
import api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';
import SearchableSelect from '@/components/SearchableSelect';
import { cn } from '@/lib/utils';

interface Registration {
    _id: string;
    chestNumber: string;
    participants: { registrationCode: string }[];
    program: { _id: string, name: string, type: string };
    pointsObtained: number;
    rank: number;
}

interface Program {
    _id: string;
    name: string;
    isResultPublished?: boolean;
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

    const currentProgram = useMemo(() => 
        programs.find(p => p._id === selectedProgram), 
        [programs, selectedProgram]
    );

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
            const res = await api.get(`/registrations/program/${selectedProgram}?page=${pageNum}&limit=20&search=${searchStr}&status=completed,participated`);
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

    const handlePublish = async () => {
        if (selectedProgram === 'none') return;
        if (!confirm('Are you sure you want to publish the results? This will finalize the scores and make them public. This action cannot be undone.')) return;

        try {
            const res = await api.post(`/programs/${selectedProgram}/publish`);
            if (res.data.success) {
                showSuccess('Results published successfully');
                // Refresh programs to update published status
                fetchPrograms();
            }
        } catch (error) {
            showError(error);
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

    // Score Editing Logic
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [scoreValue, setScoreValue] = useState<string>('');
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);

    const handleScoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !scoreValue || !selectedProgram) return;
        
        setIsSubmittingScore(true);
        try {
            const res = await api.post('/scores/submit', {
                programId: selectedProgram,
                registrationId: selectedRegistration._id,
                criteria: { "Mark": parseFloat(scoreValue) }
            });
            
            if (res.data.success) {
                showSuccess('Score submitted successfully');
                setIsScoreModalOpen(false);
                setScoreValue('');
                setSelectedRegistration(null);
                fetchRegistrations(page, debouncedSearch); // Refresh data
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsSubmittingScore(false);
        }
    };

    const isPublished = currentProgram?.isResultPublished || false;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Scoring & Results</h1>
                {selectedProgram !== 'none' && (
                    <div className="flex items-center gap-2">
                         {isPublished ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold border border-green-500/20">
                                <CheckCircle className="h-4 w-4" />
                                Results Published
                            </span>
                        ) : (
                            <button 
                                onClick={handlePublish}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                            >
                                <Share className="h-4 w-4" />
                                Publish Results
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Score Modal */}
            {isScoreModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground transition-all backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                             <Trophy className="h-5 w-5 text-yellow-500" />
                             {selectedRegistration.pointsObtained ? 'Edit Score' : 'Add Score'}
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6">
                            Update marks for chest number <span className="font-bold text-primary">{selectedRegistration.chestNumber}</span>
                        </p>
                        
                        <form onSubmit={handleScoreSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Marks / Points</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    autoFocus
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-lg font-bold outline-none focus:border-primary text-center"
                                    placeholder="0.00"
                                    value={scoreValue}
                                    onChange={e => setScoreValue(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setIsScoreModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmittingScore}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingScore ? 'Updating...' : 'Update Score'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
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

                <div className="w-full md:w-80">
                    <SearchableSelect 
                        options={programs}
                        value={selectedProgram}
                        onChange={(val) => {
                            setSelectedProgram(val);
                            setPage(1);
                            setSearchTerm('');
                        }}
                        placeholder="Search & Select Program..."
                        disabled={progLoading}
                    />
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
                                                    <span key={i} className="text-xs">{p.registrationCode}</span>
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
                                            {isPublished ? (
                                                 <span className="text-muted-foreground/50 flex items-center gap-1 text-xs font-bold justify-end">
                                                    <Lock className="h-3 w-3" />
                                                    Locked
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRegistration(reg);
                                                        setScoreValue(reg.pointsObtained?.toString() || '');
                                                        setIsScoreModalOpen(true);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-1 text-xs font-bold ml-auto transition-colors",
                                                        reg.pointsObtained 
                                                            ? "text-primary hover:text-primary/80" 
                                                            : "text-green-500 hover:text-green-400"
                                                    )}
                                                >
                                                    {reg.pointsObtained ? (
                                                        <>
                                                            <Edit3 className="h-3 w-3" />
                                                            Edit Score
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlusCircle className="h-3 w-3" />
                                                            Add Score
                                                        </>
                                                    )}
                                                </button>
                                            )}
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
