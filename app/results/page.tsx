"use client";
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { Trophy, Medal, Search, Award, User, School, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Program {
    _id: string;
    name: string;
    type: string;
    category: string;
}

interface Result {
    rank: number;
    participants: {
        name: string;
        registrationCode: string;
        college: {
            name: string;
            logo?: string;
        };
    }[];
    chestNumber?: string;
}

export default function ResultsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await api.get('/public/programs');
                if (res.data.success) {
                    setPrograms(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch programs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchResults = async (programId: string) => {
        setResultsLoading(true);
        try {
            const res = await api.get(`/public/results/${programId}`);
            if (res.data.success) {
                setResults(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch results", error);
            setResults([]);
        } finally {
            setResultsLoading(false);
        }
    };

    const handleProgramSelect = (program: Program) => {
        setSelectedProgramId(program._id);
        setSearchTerm('');
        setIsOpen(false);
        fetchResults(program._id);
    };

    const filteredPrograms = programs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedProgram = programs.find(p => p._id === selectedProgramId);

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
            case 2: return 'text-slate-400 border-slate-400/20 bg-slate-400/5';
            case 3: return 'text-amber-700 border-amber-700/20 bg-amber-700/5';
            default: return 'text-muted-foreground border-border bg-muted/50';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-5 w-5 md:h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 md:h-6 w-6 text-slate-400" />;
            case 3: return <Medal className="h-5 w-5 md:h-6 w-6 text-amber-700" />;
            default: return <Award className="h-5 w-5 md:h-6 w-6 text-muted-foreground" />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                        Program <span className="text-primary italic">Results</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Select a program to view the winners and their standings.
                    </p>
                </div>

                {/* Searchable Dropdown */}
                <div className="mb-16 relative z-50 px-4" ref={dropdownRef}>
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group shadow-sm text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Award className="h-5 w-5 text-primary" />
                                <span className={cn("font-bold", !selectedProgram && "text-muted-foreground")}>
                                    {selectedProgram ? selectedProgram.name : "Select a Program"}
                                </span>
                            </div>
                            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                        </button>

                        {isOpen && (
                            <div className="absolute top-full left-4 right-4 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search programs..."
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-semibold"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {loading ? (
                                        <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div></div>
                                    ) : filteredPrograms.length > 0 ? (
                                        filteredPrograms.map(program => (
                                            <button
                                                key={program._id}
                                                onClick={() => handleProgramSelect(program)}
                                                className={cn(
                                                    "w-full text-left px-6 py-4 hover:bg-muted transition-colors flex items-center justify-between border-b border-border last:border-0",
                                                    selectedProgramId === program._id && "bg-primary/5 text-primary"
                                                )}
                                            >
                                                <div>
                                                    <p className="font-bold">{program.name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                                        {program.category.replace('_', ' ')} • {program.type}
                                                    </p>
                                                </div>
                                                {selectedProgramId === program._id && <Check className="h-4 w-4" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground text-sm">No programs found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Program Display */}
                {selectedProgramId && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {loading || resultsLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30">
                                <Award className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">Results for this program haven't been published yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {results.map((result) => (
                                    <div key={result.rank} className={`group relative bg-card border ${getRankColor(result.rank)} rounded-xl p-3 md:p-5 flex flex-row items-center gap-3 md:gap-4 transition-all hover:scale-[1.01]`}>
                                        <div className="shrink-0 flex items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl bg-background/50 border border-inherit">
                                            {getRankIcon(result.rank)}
                                        </div>
                                        
                                        <div className="flex-1 text-left">
                                            <div className="flex flex-row items-center gap-2 mb-1">
                                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Rank {result.rank}</span>
                                                <div className="h-px bg-current opacity-10 flex-1"></div>
                                            </div>
                                            
                                            {result.participants.map((participant, pIndex) => (
                                                <div key={pIndex} className="space-y-1">
                                                    <h3 className="text-lg md:text-2xl font-black tracking-tight line-clamp-1">{participant.name}</h3>
                                                    <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 text-muted-foreground">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-background/50 border border-border text-[9px] md:text-[10px] font-bold" title="Registration Number">
                                                            <User className="h-2.5 w-2.5 md:h-3 w-3" />
                                                            {participant.registrationCode}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] md:text-[10px] font-bold" title="Chest Number">
                                                            <Award className="h-2.5 w-2.5 md:h-3 w-3" />
                                                            {result.chestNumber}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-background/50 border border-border text-[9px] md:text-[10px] font-bold max-w-[150px] md:max-w-none">
                                                            <School className="h-2.5 w-2.5 md:h-3 w-3" />
                                                            <span className="truncate">{participant.college.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="shrink-0 hidden xs:block">
                                            {result.participants[0].college.logo ? (
                                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-white p-1.5 md:p-2 shadow-sm md:shadow-lg border border-border/50">
                                                    <Image 
                                                        src={result.participants[0].college.logo} 
                                                        alt={result.participants[0].college.name} 
                                                        width={56} 
                                                        height={56} 
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-muted flex items-center justify-center border border-border">
                                                    <School className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Placeholder when nothing is selected */}
                {!selectedProgramId && (
                    <div className="text-center py-32 opacity-20">
                        <Search className="h-24 w-24 mx-auto mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">Search a program above</h2>
                    </div>
                )}
            </main>
        </div>
    );
}
