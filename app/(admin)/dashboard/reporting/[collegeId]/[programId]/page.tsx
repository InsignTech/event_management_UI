"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
    Search, 
    ChevronLeft, 
    CheckCircle, 
    AlertCircle,
    UserCheck,
    Users,
    ClipboardCheck,
    Trophy,
    XCircle,
    Ban
} from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import Link from 'next/link';

interface Student {
    _id: string;
    name?: string;
    registrationCode: string;
    phone: string;
    college: { _id: string, name: string };
}

interface Registration {
    _id: string;
    chestNumber?: string;
    participants: Student[];
    status: string;
    program: {
        _id: string;
        name: string;
        category: string;
        type: string;
    };
}

const ParticipantsList = ({ participants }: { participants: Student[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const limit = 3;
    const hasMore = participants.length > limit;
    const visibleParticipants = isExpanded ? participants : participants.slice(0, limit);

    return (
        <div className="space-y-3">
            {visibleParticipants.map(student => (
                <div key={student._id} className="flex items-center gap-4 bg-secondary/20 p-3 rounded-2xl border border-border/40">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{student.name || 'N/A'}</p>
                        <p className="text-[11px] text-muted-foreground font-mono font-medium">{student.registrationCode}</p>
                    </div>
                </div>
            ))}
            
            {hasMore && (
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-[10px] font-black text-primary hover:underline ml-1 uppercase tracking-widest flex items-center gap-1 mt-1"
                >
                    {isExpanded ? 'Show Less' : `+ ${participants.length - limit} More Participants`}
                </button>
            )}
        </div>
    );
};

export default function ProgramReportingPage() {
    const params = useParams();
    const { collegeId, programId } = params;
    
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [college, setCollege] = useState<{name: string} | null>(null);
    const [program, setProgram] = useState<{name: string, category: string, type: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('confirmed');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [chestNumber, setChestNumber] = useState('');
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (collegeId && programId) {
            fetchBasicData();
            fetchRegistrations();
        }
    }, [collegeId, programId, filterStatus]);

    const fetchBasicData = async () => {
        try {
            const [collegeRes, programRes] = await Promise.all([
                api.get(`/colleges/${collegeId}`),
                api.get(`/programs/${programId}`)
            ]);
            
            if (collegeRes.data.success) setCollege(collegeRes.data.data);
            if (programRes.data.success) setProgram(programRes.data.data);
        } catch (error) {
            showError(error);
        }
    };

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/registrations/college/${collegeId}`, {
                params: { 
                    status: filterStatus === 'all' ? undefined : filterStatus,
                    program: programId
                }
            });
            if (res.data.success) {
                setRegistrations(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !chestNumber) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/registrations/${selectedRegistration._id}/report`, {
                chestNumber
            });
            if (res.data.success) {
                showSuccess('Chest number assigned and reported');
                setIsReportModalOpen(false);
                setChestNumber('');
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkParticipated = async (id: string) => {
        if (!confirm('Mark this participant as Participated?')) return;
        try {
            const res = await api.patch(`/registrations/${id}/status`, {
                status: 'participated'
            });
            if (res.data.success) {
                showSuccess('Status updated to participated');
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const res = await api.patch(`/registrations/${id}/status`, { status });
            if (res.data.success) {
                showSuccess(`Status updated to ${status}`);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        }
    };

    const filteredRegistrations = registrations.filter(r => 
        r.participants.some(p => 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.chestNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6 font-sans text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <Link 
                    href={`/dashboard/reporting/${collegeId}`}
                    className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2 w-fit"
                >
                    <ChevronLeft className="h-3 w-3" />
                    BACK TO PROGRAMS
                </Link>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight">{program?.name || 'Program Reporting'}</h1>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">
                                {program?.category}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            College: <span className="font-bold text-foreground">{college?.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status Filter */}
                        <select 
                            className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:border-primary transition-all"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="confirmed">CONFIRMED</option>
                            <option value="reported">REPORTED</option>
                            <option value="participated">PARTICIPATED</option>
                            <option value="all">ALL STAGES</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center px-4 py-2 bg-card border border-border rounded-xl w-full sm:max-w-md shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground mr-3" />
                    <input 
                        type="text" 
                        placeholder="Search by name, code or chest no..." 
                        className="bg-transparent border-none outline-none text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Registrations List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">Fetching registrations...</p>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/30 border-2 border-dashed border-border rounded-3xl text-center">
                        <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground font-bold italic">No registrations found in this stage.</p>
                    </div>
                ) : (
                    filteredRegistrations.map((reg) => (
                        <div 
                            key={reg._id} 
                            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${
                                        reg.status === 'confirmed' 
                                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                                            : reg.status === 'reported'
                                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    }`}>
                                        {reg.status}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reg.chestNumber && (
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[10px] font-black border border-primary/20">
                                                {reg.chestNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <ParticipantsList participants={reg.participants} />
                                    {reg.participants.length > 1 && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-400 bg-purple-400/5 px-2 py-1 rounded w-fit uppercase tracking-widest">
                                            <Users className="h-3 w-3" /> GROUP ENTRY ({reg.participants.length})
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/50">
                                {reg.status === 'confirmed' ? (
                                    <button 
                                        onClick={() => { setSelectedRegistration(reg); setIsReportModalOpen(true); }}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20"
                                    >
                                        <Trophy className="h-4 w-4" />
                                        REPORT & ASSIGN CHEST NO
                                    </button>
                                ) : reg.status === 'reported' ? (
                                    <button 
                                        onClick={() => handleMarkParticipated(reg._id)}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        MARK AS PARTICIPATED
                                    </button>
                                ) : (
                                    <div className="w-full bg-emerald-500/10 text-emerald-600 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        PARTICIPATED
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Report Modal */}
            {isReportModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-center mb-2 tracking-tight">Report Registration</h2>
                        <p className="text-sm text-muted-foreground text-center mb-8">
                            Enter the chest number for participants of <span className="text-foreground font-bold">{selectedRegistration.participants.map(p => p.name).join(', ')}</span>.
                        </p>
                        
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chest Number</label>
                                <input 
                                    required
                                    autoFocus
                                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                                    placeholder="e.g. C101"
                                    value={chestNumber}
                                    onChange={e => setChestNumber(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { setIsReportModalOpen(false); setSelectedRegistration(null); setChestNumber(''); }}
                                    className="px-4 py-3 bg-secondary hover:bg-muted text-foreground border border-border rounded-xl text-xs font-black transition-all active:scale-[0.98]"
                                >
                                    BACK
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !chestNumber}
                                    className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'REPORTING...' : 'CONFIRM REPORT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
