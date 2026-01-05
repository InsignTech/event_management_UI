"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Trash2, UserCheck, Users, Trophy, Star } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import SearchableSelect from '@/components/SearchableSelect';
import { showError, showSuccess } from '@/lib/toast';

interface Student {
    _id: string;
    name?: string;
    universityRegNo: string;
    college: { _id: string, name: string };
}

interface Registration {
    _id: string;
    chestNumber: string;
    participants: Student[];
    status: string;
    pointsObtained: number;
}

export default function ProgramRegistrationsPage() {
    const params = useParams();
    const { id: eventId, programId } = params;
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [scoreValue, setScoreValue] = useState<string>('');
    const [isSubmittingScore, setIsSubmittingScore] = useState(false);

    const [colleges, setColleges] = useState<{_id: string, name: string}[]>([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [searchingStudents, setSearchingStudents] = useState(false);

    useEffect(() => {
        if (programId) {
            fetchRegistrations();
            fetchColleges();
        }
    }, [programId]);

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

    const fetchRegistrations = async () => {
        try {
            const res = await api.get(`/registrations/program/${programId}`);
            if (res.data.success) {
                setRegistrations(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (selectedStudentIds.length === 0) return;
        try {
            const res = await api.post('/registrations', { 
                program: programId, 
                participants: selectedStudentIds 
            });
            if (res.data.success) {
                showSuccess('Registration successful');
                setIsModalOpen(false);
                setSelectedStudentIds([]);
                setSelectedCollege('');
                setStudentSearch('');
                fetchRegistrations();
            }
        } catch (error: any) {
            showError(error);
        }
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

    const handleScoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRegistration || !scoreValue) return;
        
        setIsSubmittingScore(true);
        try {
            const res = await api.post('/scores/submit', {
                programId,
                registrationId: selectedRegistration._id,
                criteria: { "Mark": parseFloat(scoreValue) }
            });
            
            if (res.data.success) {
                showSuccess('Score submitted successfully');
                setIsScoreModalOpen(false);
                setScoreValue('');
                setSelectedRegistration(null);
                fetchRegistrations();
            }
        } catch (error) {
            showError(error);
        } finally {
            setIsSubmittingScore(false);
        }
    };

    const filteredRegistrations = registrations.filter(r => 
        r.chestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.participants.some(p => 
            p.universityRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <h1 className="text-3xl font-bold">Registrations</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Registration
                </button>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Register for Program</h2>
                        
                        <div className="mb-4">
                            <label className="text-xs text-muted-foreground block mb-2">Selected Participants</label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-secondary rounded-lg border border-border">
                                {selectedStudentIds.length === 0 && <span className="text-xs text-muted-foreground italic">No students selected</span>}
                                {selectedStudentIds.map(id => {
                                    const student = allStudents.find(s => s._id === id) || registrations.flatMap(r => r.participants).find(p => p._id === id);
                                    return (
                                        <span key={id} className="bg-primary/20 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                            {student?.name || student?.universityRegNo}
                                            <button 
                                                onClick={() => setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id))}
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
                            <SearchableSelect 
                                label="Filter by College"
                                options={colleges}
                                value={selectedCollege}
                                onChange={setSelectedCollege}
                                placeholder="Select College..."
                            />

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
                                    allStudents.filter(s => !selectedStudentIds.includes(s._id)).map(student => (
                                        <button 
                                            key={student._id}
                                            onClick={() => {
                                                setSelectedStudentIds([...selectedStudentIds, student._id]);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-muted text-sm transition-colors flex justify-between items-center group"
                                        >
                                            <div>
                                                <p className="font-bold">{student.name || 'Unknown student'}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{student.universityRegNo} • {student.college.name}</p>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedStudentIds([]);
                                    setSelectedCollege('');
                                    setStudentSearch('');
                                }}
                                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreate}
                                disabled={selectedStudentIds.length === 0}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Score Modal */}
            {isScoreModalOpen && selectedRegistration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                             <Trophy className="h-5 w-5 text-yellow-500" />
                             Submit Score
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6">
                            Enter marks for chest number <span className="font-bold text-primary">{selectedRegistration.chestNumber}</span>
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
                                    {isSubmittingScore ? 'Submitting...' : 'Save Score'}
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
                                <th className="px-6 py-4">Score</th>
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
                                                {reg.chestNumber}
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
                                                            {p.universityRegNo} • {p.college.name}
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
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider ${
                                                reg.status === 'completed'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                                {reg.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${reg.pointsObtained > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                                                    <Star className={`h-4 w-4 ${reg.pointsObtained > 0 ? 'fill-yellow-500' : ''}`} />
                                                </div>
                                                <span className={`text-lg font-black ${reg.pointsObtained > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {reg.pointsObtained || '0.00'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                title="Submit Score"
                                                onClick={() => { setSelectedRegistration(reg); setScoreValue(reg.pointsObtained?.toString() || ''); setIsScoreModalOpen(true); }}
                                                className="p-2 hover:bg-yellow-500/10 rounded-lg text-muted-foreground hover:text-yellow-500 transition-all border border-transparent hover:border-yellow-500/20"
                                            >
                                                <Trophy className="h-4 w-4" />
                                            </button>
                                            <button 
                                                title="Delete Registration"
                                                onClick={() => handleDelete(reg._id)}
                                                className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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
