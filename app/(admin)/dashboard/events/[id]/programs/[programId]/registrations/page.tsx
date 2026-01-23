"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Trash2, UserCheck, Users, Trophy, ChevronLeft, ChevronRight, Lock, CheckCircle, XCircle, Ban, AlertCircle, Edit } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';
import { showError, showSuccess } from '@/lib/toast';

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
    status: 'open' | 'confirmed' | 'reported' | 'participated' | 'absent' | 'cancelled' | 'rejected' | 'completed';
    cancellationReason?: string;
}

export default function ProgramRegistrationsPage() {
    const params = useParams();
    const { id: eventId, programId } = params;
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState<{total: number, page: number, limit: number, pages: number} | null>(null);
    const [page, setPage] = useState(1);
    const [isPublished, setIsPublished] = useState(false);
    const [programDetails, setProgramDetails] = useState<{name: string} | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [chestNumberInput, setChestNumberInput] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const [colleges, setColleges] = useState<{_id: string, name: string}[]>([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [searchingStudents, setSearchingStudents] = useState(false);

    useEffect(() => {
        if (programId) {
            fetchRegistrations(page);
            fetchColleges();
        }
    }, [programId, page]);

    // Debounced student search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (studentSearch.length >= 2 || (studentSearch.length === 0 && selectedCollege)) {
                searchStudents();
            } else if (!selectedCollege && studentSearch.length < 2) {
                setAllStudents([]); // Clear students if no college and search term is too short
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [studentSearch, selectedCollege]);

    const fetchColleges = async () => {
        try {
            const res = await api.get('/colleges');
            if (res.data.success) {
                setColleges(res.data.data);
            }
        } catch (error) {
            showError(error);
        }
    };

    const searchStudents = async () => {
        if (!selectedCollege && !studentSearch) {
            setAllStudents([]);
            return;
        }
        setSearchingStudents(true);
        try {
            const res = await api.get('/students', {
                params: {
                    college: selectedCollege,
                    search: studentSearch
                }
            });
            if (res.data.success) {
                setAllStudents(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setSearchingStudents(false);
        }
    };

    const fetchRegistrations = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/registrations/program/${programId}?page=${pageNum}&limit=50`);
            if (res.data.success) {
                setRegistrations(res.data.registrations || []);
                setPagination(res.data.pagination || null);
                setIsPublished(res.data.isResultPublished || false);
                setProgramDetails(res.data.program || null);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (selectedStudents.length === 0) return;
        try {
            const studentIds = selectedStudents.map(s => s._id);
            if (selectedRegistration) {
                // Update
                const res = await api.put(`/registrations/${selectedRegistration._id}`, {
                    participants: studentIds
                });
                if (res.data.success) {
                    showSuccess('Registration updated successfully');
                    closeModal();
                    fetchRegistrations();
                }
            } else {
                // Create
                const res = await api.post('/registrations', { 
                    program: programId, 
                    participants: studentIds 
                });
                if (res.data.success) {
                    showSuccess('Registration successful');
                    closeModal();
                    fetchRegistrations();
                }
            }
        } catch (error: any) {
            showError(error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRegistration(null);
        setSelectedStudents([]);
        setSelectedCollege('');
        setStudentSearch('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this registration?')) return;
        try {
            const res = await api.delete(`/registrations/${id}`);
            if (res.data.success) {
                showSuccess('Registration deleted successfully');
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

    const handleCancelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !cancellationReason) return;
        try {
            const res = await api.post(`/registrations/${selectedRegistration._id}/cancel`, {
                reason: cancellationReason
            });
            if (res.data.success) {
                showSuccess('Registration cancelled');
                setIsCancelModalOpen(false);
                setCancellationReason('');
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !chestNumberInput) return;
        setIsReporting(true);
        try {
            const res = await api.post(`/registrations/${selectedRegistration._id}/report`, {
                chestNumber: chestNumberInput
            });
            if (res.data.success) {
                showSuccess('Chest number assigned and reported');
                setIsReportModalOpen(false);
                setChestNumberInput('');
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error: any) {
            showError(error);
        } finally {
            setIsReporting(false);
        }
    };

    const handleExport = async (type: 'college' | 'program') => {
        try {
            const url = type === 'college' 
                ? '/exports/college-wise' 
                : `/exports/program-wise/${programId}`;
            const filename = type === 'college' 
                ? 'college_wise_registrations.xlsx' 
                : `${programDetails?.name || 'program'}_registrations.xlsx`;
            
            const res = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            showSuccess('Export started');
        } catch (error) {
            showError(error);
        }
    };



    const filteredRegistrations = registrations.filter(r => 
        (r.chestNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        r.participants.some(p => 
            p.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/events" className="hover:text-primary">Events</Link>
                <span>/</span>
                <Link href={`/dashboard/events/${eventId}/programs`} className="hover:text-primary">Programs</Link>
                <span>/</span>
                <span className="text-foreground font-medium">Registrations</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Registrations</h1>
                    {programDetails && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 font-sans">
                            Program: <span className="text-primary font-bold px-2 py-0.5 bg-primary/10 rounded">{programDetails.name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleExport('college')}
                        className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground px-4 py-2 rounded-lg transition-colors border border-border"
                    >
                        Export College-wise
                    </button>
                    <button 
                        onClick={() => handleExport('program')}
                        className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground px-4 py-2 rounded-lg transition-colors border border-border"
                    >
                        Export Program-wise
                    </button>
                    <button 
                        disabled={isPublished}
                        title={isPublished ? "Registration Closed (Published)" : "New Registration"}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublished ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        New Registration
                    </button>
                </div>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">{selectedRegistration ? 'Edit Registration' : 'Register for Program'}</h2>
                        
                        <div className="mb-4">
                            <label className="text-xs text-muted-foreground block mb-2">Selected Participants</label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-secondary rounded-lg border border-border">
                                {selectedStudents.length === 0 && <span className="text-xs text-muted-foreground italic">No students selected</span>}
                                {selectedStudents.map(student => {
                                    return (
                                        <span key={student._id} className="bg-primary/20 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                            {student.name || student.registrationCode}
                                            <button 
                                                onClick={() => setSelectedStudents(selectedStudents.filter(s => s._id !== student._id))}
                                                className="hover:text-foreground"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            <div className="relative">
                                <SearchableSelect 
                                    label="Filter by College"
                                    options={colleges}
                                    value={selectedCollege}
                                    onChange={(val) => {
                                        if (selectedStudents.length > 0) return;
                                        setSelectedCollege(val);
                                    }}
                                    placeholder="Select College..."
                                    disabled={selectedStudents.length > 0}
                                />
                                {selectedStudents.length > 0 && (
                                    <p className="text-[10px] text-primary mt-1 flex items-center gap-1 font-bold">
                                        <Lock className="h-3 w-3" /> College locked (Group members must be from same college)
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                                    placeholder="Search by Name or Reg No..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto border border-border rounded-lg divide-y divide-border min-h-[200px]">
                                {searchingStudents ? (
                                    <p className="p-4 text-center text-xs text-muted-foreground">Searching...</p>
                                ) : allStudents.length === 0 ? (
                                    <p className="p-4 text-center text-xs text-muted-foreground italic truncate">
                                        {!selectedCollege ? "Select a college first" : "No students found"}
                                    </p>
                                ) : (
                                    allStudents
                                        .filter(s => !selectedStudents.some(sel => sel._id === s._id))
                                        .filter(s => {
                                            // Ensure same college if others are selected
                                            if (selectedStudents.length === 0) return true;
                                            const firstStudent = selectedStudents[0];
                                            return s.college._id === firstStudent?.college._id;
                                        })
                                        .map(student => (
                                        <button 
                                            key={student._id}
                                            onClick={() => {
                                                if (selectedStudents.length === 0) {
                                                    setSelectedCollege(student.college._id);
                                                }
                                                setSelectedStudents([...selectedStudents, student]);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-muted text-sm transition-colors flex justify-between items-center group"
                                        >
                                            <div>
                                                <p className="font-bold">{student.name || 'Unknown student'}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{student.registrationCode} • {student.college.name}</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={closeModal}
                                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateOrUpdate}
                                disabled={selectedStudents.length === 0}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedRegistration ? 'Save Changes' : 'Register'}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Cancel Modal */}
            {isCancelModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-destructive">
                             <Ban className="h-5 w-5" />
                             Cancel Registration
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6">
                            Reason for cancellation of <span className="font-bold">{selectedRegistration.chestNumber}</span>
                        </p>
                        
                        <form onSubmit={handleCancelSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Reason</label>
                                <textarea 
                                    required
                                    rows={3}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                                    placeholder="e.g. Student absent, Disqualified..."
                                    value={cancellationReason}
                                    onChange={e => setCancellationReason(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/90 transition-colors"
                                >
                                    Confirm Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* Report Modal */}
            {isReportModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                             <Trophy className="h-5 w-5 text-yellow-500" />
                             Report Registration
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6">
                            Enter chest number for participants of <span className="font-bold">{selectedRegistration.participants.map(p => p.name).join(', ')}</span>
                        </p>
                        
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Chest Number</label>
                                <input 
                                    required
                                    autoFocus
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    placeholder="e.g. C101"
                                    value={chestNumberInput}
                                    onChange={e => setChestNumberInput(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsReportModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isReporting}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isReporting ? 'Reporting...' : 'Confirm Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search by Chest No, Name or Reg No..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Chest Number</th>
                                <th className="px-6 py-4">Participants</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        Loading registrations...
                                    </td>
                                </tr>
                            ) : filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                        No registrations found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-primary/10 text-primary px-3 py-1 rounded-md text-base font-black">
                                                {reg.chestNumber || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {reg.participants.map((p) => (
                                                    <div key={p._id} className="flex flex-col gap-0.5 mb-1 last:mb-0">
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-medium text-foreground">{p.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground ml-5 font-medium">
                                                            {p.registrationCode} • {p.college.name}
                                                        </div>
                                                    </div>
                                                ))}
                                                {reg.participants.length > 1 && (
                                                    <span className="text-[10px] text-purple-400 font-bold flex items-center gap-1 mt-1 bg-purple-400/10 w-fit px-1.5 py-0.5 rounded">
                                                        <Users className="h-3 w-3" /> GROUP ENTRY
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider uppercase ${
                                                    reg.status === 'participated'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : reg.status === 'confirmed'
                                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                        : reg.status === 'reported'
                                                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                        : reg.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : reg.status === 'cancelled' || reg.status === 'rejected'
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                    {reg.status.replace('_', ' ')}
                                                </span>
                                                {reg.cancellationReason && (
                                                    <span className="text-[10px] text-destructive italic max-w-[150px] truncate" title={reg.cancellationReason}>
                                                        {reg.cancellationReason}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {reg.status === 'open' && (
                                                    <button 
                                                        title="Confirm Registration"
                                                        onClick={() => handleStatusUpdate(reg._id, 'confirmed')}
                                                        className="p-2 hover:bg-blue-500/10 rounded-lg text-muted-foreground hover:text-blue-500 transition-all"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {reg.status === 'confirmed' && (
                                                    <button 
                                                        title="Mark as Reported (Assign Chest No)"
                                                        onClick={() => { setSelectedRegistration(reg); setChestNumberInput(''); setIsReportModalOpen(true); }}
                                                        className="p-2 hover:bg-yellow-500/10 rounded-lg text-muted-foreground hover:text-yellow-500 transition-all"
                                                    >
                                                        <Trophy className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {reg.status === 'reported' && (
                                                    <button 
                                                        title="Mark as Participated"
                                                        onClick={() => handleStatusUpdate(reg._id, 'participated')}
                                                        className="p-2 hover:bg-green-500/10 rounded-lg text-muted-foreground hover:text-green-500 transition-all"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                
                                                {reg.status !== 'cancelled' && reg.status !== 'rejected' && (
                                                    <div className="flex gap-1">
                                                        <button 
                                                            title="Reject Registration"
                                                            onClick={() => handleStatusUpdate(reg._id, 'rejected')}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            title="Cancel Registration"
                                                            onClick={() => { setSelectedRegistration(reg); setIsCancelModalOpen(true); }}
                                                            className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}


                                                <button 
                                                    title="Edit Registration"
                                                    onClick={() => {
                                                        setSelectedRegistration(reg);
                                                        setSelectedStudents(reg.participants);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                <button 
                                                    title="Delete Permanently"
                                                    onClick={() => handleDelete(reg._id)}
                                                    className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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
                                className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs font-medium">Page {page} of {pagination.pages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
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
