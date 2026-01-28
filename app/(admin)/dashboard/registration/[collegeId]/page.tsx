"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Mic2,
    Calendar,
    ArrowRight,
    Search,
    ListFilter,
    CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import Link from 'next/link';

interface Program {
    _id: string;
    name: string;
    category: string;
    type: string;
    startTime?: string;
    venue?: string;
    collegeStatus?: string;
}

export default function CollegeProgramsPage() {
    const params = useParams();
    const { collegeId } = params;
    
    const [programs, setPrograms] = useState<Program[]>([]);
    const [college, setCollege] = useState<{name: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (collegeId) {
            fetchCollege();
            fetchPrograms();
        }
    }, [collegeId]);

    const fetchCollege = async () => {
        try {
            const res = await api.get(`/colleges/${collegeId}`);
            if (res.data.success) {
                setCollege(res.data.data);
            }
        } catch (error) {
            showError(error);
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/registrations/college/${collegeId}/programs`);
            if (res.data.success) {
                setPrograms(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAll = async () => {
        if (!window.confirm("Are you sure you want to confirm ALL open registrations for this college?")) return;
        
        setIsConfirming(true);
        try {
            const res = await api.post(`/registrations/college/${collegeId}/confirm-all`);
            if (res.data.success) {
                showSuccess(res.data.message || "All registrations confirmed successfully");
                fetchPrograms(); // Refresh the list to show updated statuses
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsConfirming(false);
        }
    };

    const filteredPrograms = programs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <Link 
                    href="/dashboard/registration"
                    className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2 w-fit"
                >
                    <ChevronLeft className="h-3 w-3" />
                    BACK TO COLLEGES
                </Link>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{college?.name || 'College Programs'}</h1>
                        <p className="text-sm text-muted-foreground mt-1">Select a program to manage its registrations</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleConfirmAll}
                            disabled={isConfirming || programs.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 transition-all active:scale-95"
                        >
                            {isConfirming ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            CONFIRM ALL
                        </button>

                        <div className="flex items-center px-4 py-2 bg-card border border-border rounded-xl w-full sm:max-w-xs shadow-sm focus-within:border-primary/50 transition-all">
                            <Search className="h-4 w-4 text-muted-foreground mr-3" />
                            <input 
                                type="text" 
                                placeholder="Search programs..." 
                                className="bg-transparent border-none outline-none text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Programs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">Fetching registered programs...</p>
                    </div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/30 border-2 border-dashed border-border rounded-3xl text-center">
                        <Mic2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-bold italic">No programs registered for this college.</p>
                    </div>
                ) : (
                    filteredPrograms.map((program) => (
                        <Link 
                            key={program._id} 
                            href={`/dashboard/registration/${collegeId}/${program._id}`}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {/* <Mic2 className="h-12 w-12" /> */}
                            </div>
                            
                            <div>
                                <div className="flex flex-col gap-1 mb-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 w-fit px-2 py-0.5 rounded">
                                            {program.category}
                                        </span>
                                        {program.collegeStatus && (
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-[0.05em] ${
                                                program.collegeStatus === 'open' 
                                                    ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
                                                    : program.collegeStatus === 'confirmed'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : program.collegeStatus === 'reported'
                                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                    : program.collegeStatus === 'participated'
                                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                                    : program.collegeStatus === 'completed'
                                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                                    : 'bg-red-500/10 text-red-600 border-red-500/20'
                                            }`}>
                                                {program.collegeStatus}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors mt-2">
                                        {program.name}
                                    </h3>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {program.type.toUpperCase()} PROGRAM
                                    </div>
                                    {program.venue && (
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                            VENUE: {program.venue}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between text-primary font-black text-xs uppercase tracking-widest">
                                <span>Manage Registrations</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
