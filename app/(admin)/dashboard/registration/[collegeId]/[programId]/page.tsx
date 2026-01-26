"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    Search, 
    ChevronLeft, 
    Plus, 
    CheckCircle, 
    AlertCircle,
    UserCheck,
    Users,
    ClipboardCheck,
    Ban,
    Edit
} from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import Link from 'next/link';
import MultiSearchableSelect from '@/components/MultiSearchableSelect';

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

export default function ProgramRegistrationsPage() {
    const params = useParams();
    const { collegeId, programId } = params;
    
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [college, setCollege] = useState<{name: string} | null>(null);
    const [program, setProgram] = useState<{name: string, category: string, type: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'open' | 'all'>('open');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // New/Edit Registration Modal State
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cancellation State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    useEffect(() => {
        if (collegeId && programId) {
            fetchBasicData();
            fetchRegistrations();
        }
    }, [collegeId, programId, filterStatus]);

    const fetchBasicData = async () => {
        try {
            const [collegeRes, programRes, studentsRes] = await Promise.all([
                api.get(`/colleges/${collegeId}`),
                api.get(`/programs/${programId}`),
                api.get('/students', { params: { college: collegeId } })
            ]);
            
            if (collegeRes.data.success) setCollege(collegeRes.data.data);
            if (programRes.data.success) setProgram(programRes.data.data);
            if (studentsRes.data.success) setAllStudents(studentsRes.data.data);
        } catch (error) {
            showError(error);
        }
    };

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const statusFilter = filterStatus === 'open' ? 'open' : undefined;
            const res = await api.get(`/registrations/college/${collegeId}`, {
                params: { 
                    status: statusFilter,
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

    const handleConfirmRegistration = async () => {
        if (!selectedRegistration) return;
        setIsUpdating(true);
        try {
            const res = await api.patch(`/registrations/${selectedRegistration._id}/status`, {
                status: 'confirmed'
            });
            if (res.data.success) {
                showSuccess('Registration confirmed successfully');
                setIsConfirmModalOpen(false);
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleNewRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudents.length === 0) return;
        setIsSubmitting(true);
        try {
            if (selectedRegistration) {
                // Update
                const res = await api.put(`/registrations/${selectedRegistration._id}`, {
                    participants: selectedStudents
                });
                if (res.data.success) {
                    showSuccess('Registration updated successfully');
                    setIsNewModalOpen(false);
                    setSelectedRegistration(null);
                    setSelectedStudents([]);
                    fetchRegistrations();
                }
            } else {
                // Create
                const res = await api.post('/registrations', {
                    program: programId,
                    participants: selectedStudents
                });
                if (res.data.success) {
                    showSuccess('New registration added successfully');
                    setIsNewModalOpen(false);
                    setSelectedStudents([]);
                    fetchRegistrations();
                }
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !cancellationReason) return;
        setIsSubmitting(true);
        try {
            const res = await api.post(`/registrations/${selectedRegistration._id}/cancel`, {
                reason: cancellationReason
            });
            if (res.data.success) {
                showSuccess('Registration cancelled successfully');
                setIsCancelModalOpen(false);
                setCancellationReason('');
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRegistrations = registrations.filter(r => 
        r.participants.some(p => 
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.registrationCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6 font-sans text-foreground">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <Link 
                    href={`/dashboard/registration/${collegeId}`}
                    className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2 w-fit"
                >
                    <ChevronLeft className="h-3 w-3" />
                    BACK TO PROGRAMS
                </Link>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight">{program?.name || 'Program Registrations'}</h1>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded h-fit">
                                {program?.category}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            College: <span className="font-bold text-foreground">{college?.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setSelectedRegistration(null);
                                setSelectedStudents([]);
                                setIsNewModalOpen(true);
                            }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                            <Plus className="h-4 w-4" />
                            NEW REGISTRATION
                        </button>

                        <div className="bg-secondary/50 p-1 rounded-xl border border-border flex gap-1 h-fit">
                            <button 
                                onClick={() => setFilterStatus('open')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                    filterStatus === 'open' 
                                        ? 'bg-primary text-primary-foreground shadow-sm' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                OPEN
                            </button>
                            <button 
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                                    filterStatus === 'all' 
                                        ? 'bg-primary text-primary-foreground shadow-sm' 
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                ALL
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center px-4 py-2 bg-card border border-border rounded-xl w-full sm:max-w-md shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground mr-3" />
                    <input 
                        type="text" 
                        placeholder="Search participants by name or code..." 
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
                        <p className="text-muted-foreground font-bold italic">No {filterStatus === 'open' ? 'open' : ''} registrations found for this program.</p>
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
                                        reg.status === 'open' 
                                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
                                            : reg.status === 'confirmed'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                                    }`}>
                                        {reg.status}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {(reg.status === 'open' || reg.status === 'confirmed') && (
                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRegistration(reg);
                                                        setSelectedStudents(reg.participants.map(p => p._id));
                                                        setIsNewModalOpen(true);
                                                    }}
                                                    className="px-2 py-1 bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-lg text-[9px] font-black transition-all uppercase tracking-widest"
                                                >
                                                    EDIT
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRegistration(reg);
                                                        setIsCancelModalOpen(true);
                                                    }}
                                                    className="px-2 py-1 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/20 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        )}
                                        <span className="text-[10px] font-bold text-muted-foreground font-mono">
                                            ID: {reg._id.slice(-6).toUpperCase()}
                                        </span>
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
                                {reg.status === 'open' ? (
                                    <button 
                                        onClick={() => { setSelectedRegistration(reg); setIsConfirmModalOpen(true); }}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        CONFIRM REGISTRATION
                                    </button>
                                ) : (
                                    <div className="w-full bg-emerald-500/10 text-emerald-600 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        CONFIRMED
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirm Registration Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Confirm Registration?</h2>
                        <p className="text-sm text-muted-foreground mb-8">
                            Are you sure you want to confirm this registration for <span className="text-foreground font-bold">{program?.name}</span>?
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => { setIsConfirmModalOpen(false); setSelectedRegistration(null); }}
                                className="px-4 py-3 bg-secondary hover:bg-muted text-foreground border border-border rounded-xl text-xs font-black transition-all active:scale-[0.98]"
                            >
                                CANCEL
                            </button>
                            <button 
                                disabled={isUpdating}
                                onClick={handleConfirmRegistration}
                                className="px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isUpdating ? 'CONFIRMING...' : 'YES, CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Reason Modal */}
            {isCancelModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ban className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-black text-center mb-2 tracking-tight">Cancel Registration?</h2>
                        <p className="text-xs text-muted-foreground text-center mb-6">
                            Please provide a reason for cancelling this registration.
                        </p>
                        
                        <form onSubmit={handleCancelSubmit} className="space-y-4">
                            <textarea 
                                required
                                rows={3}
                                className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:border-destructive transition-all resize-none"
                                placeholder="e.g. Student absent, disqualified..."
                                value={cancellationReason}
                                onChange={e => setCancellationReason(e.target.value)}
                            />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    type="button"
                                    onClick={() => { setIsCancelModalOpen(false); setSelectedRegistration(null); setCancellationReason(''); }}
                                    className="px-4 py-3 bg-secondary hover:bg-muted text-foreground border border-border rounded-xl text-xs font-black transition-all active:scale-[0.98]"
                                >
                                    BACK
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || !cancellationReason}
                                    className="px-4 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-destructive/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'CANCELLING...' : 'CONFIRM CANCEL'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Registration Modal */}
            {isNewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Plus className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{selectedRegistration ? 'Edit Registration' : 'New Registration'}</h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{program?.name} • {college?.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleNewRegistration} className="space-y-6">
                            {/* Locked Fields Info */}
                            <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3" /> Pre-selected Information
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Program</label>
                                        <p className="text-xs font-bold truncate">{program?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">College</label>
                                        <p className="text-xs font-bold truncate">{college?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Students Selection */}
                            <div className="space-y-4">
                                <MultiSearchableSelect 
                                    label="Select Participants"
                                    options={allStudents.map(s => ({ ...s, name: s.name || 'Unknown' }))}
                                    value={selectedStudents}
                                    onChange={setSelectedStudents}
                                    placeholder="Search for students by name or code..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                                <button 
                                    type="button"
                                    onClick={() => { setIsNewModalOpen(false); setSelectedStudents([]); }}
                                    className="px-6 py-4 bg-secondary hover:bg-muted text-foreground border border-border rounded-2xl text-xs font-black transition-all active:scale-[0.98]"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting || selectedStudents.length === 0}
                                    className="px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'SAVING...' : selectedRegistration ? 'UPDATE REGISTRATION' : 'CONFIRM REGISTRATION'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
