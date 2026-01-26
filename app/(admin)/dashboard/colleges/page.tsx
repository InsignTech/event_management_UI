"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, List, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import Link from 'next/link';

interface College {
    _id: string;
    name: string;
    address: string;
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone: string;
    status: string;
    logo?: string;
}

interface Program {
    _id: string;
    name: string;
    type: string;
    category: string;
    event: string;
}

export default function CollegesPage() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isProgramsModalOpen, setIsProgramsModalOpen] = useState(false);
    const [collegePrograms, setCollegePrograms] = useState<Program[]>([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    
    const [currentCollege, setCurrentCollege] = useState<College | null>(null);
    const [newCollege, setNewCollege] = useState({
        name: '',
        address: '',
        coordinatorName: '',
        coordinatorEmail: '',
        coordinatorPhone: '',
    });

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const res = await api.get('/colleges');
            if (res.data.success) {
                setColleges(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollegePrograms = async (collegeId: string) => {
        setLoadingPrograms(true);
        setIsProgramsModalOpen(true);
        try {
            const res = await api.get(`/registrations/college/${collegeId}/programs`);
            if (res.data.success) {
                setCollegePrograms(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoadingPrograms(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/colleges', newCollege);
            if (res.data.success) {
                showSuccess('College added successfully');
                setIsModalOpen(false);
                setNewCollege({
                    name: '',
                    address: '',
                    coordinatorName: '',
                    coordinatorEmail: '',
                    coordinatorPhone: '',
                });
                fetchColleges();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCollege) return;
        try {
            const res = await api.put(`/colleges/${currentCollege._id}`, currentCollege);
            if (res.data.success) {
                showSuccess('College updated successfully');
                setIsEditModalOpen(false);
                fetchColleges();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this college?')) return;
        try {
            const res = await api.delete(`/colleges/${id}`);
            if (res.data.success) {
                showSuccess('College deleted successfully');
                fetchColleges();
            }
        } catch (error) {
            showError(error);
        }
    };

    const filteredColleges = colleges.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Colleges</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add College
                </button>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Add New College</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">College Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newCollege.name}
                                    onChange={e => setNewCollege({...newCollege, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Address</label>
                                <textarea 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-primary"
                                    value={newCollege.address}
                                    onChange={e => setNewCollege({...newCollege, address: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Coordinator Name</label>
                                    <input 
                                        required
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newCollege.coordinatorName}
                                        onChange={e => setNewCollege({...newCollege, coordinatorName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Coordinator Email</label>
                                    <input 
                                        required
                                        type="email"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newCollege.coordinatorEmail}
                                        onChange={e => setNewCollege({...newCollege, coordinatorEmail: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Coordinator Phone</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newCollege.coordinatorPhone}
                                    onChange={e => setNewCollege({...newCollege, coordinatorPhone: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Add College
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentCollege && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit College</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">College Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentCollege.name}
                                    onChange={e => setCurrentCollege({...currentCollege, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Address</label>
                                <textarea 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-primary"
                                    value={currentCollege.address}
                                    onChange={e => setCurrentCollege({...currentCollege, address: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Coordinator Name</label>
                                    <input 
                                        required
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentCollege.coordinatorName}
                                        onChange={e => setCurrentCollege({...currentCollege, coordinatorName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Coordinator Email</label>
                                    <input 
                                        required
                                        type="email"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentCollege.coordinatorEmail}
                                        onChange={e => setCurrentCollege({...currentCollege, coordinatorEmail: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Coordinator Phone</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentCollege.coordinatorPhone}
                                    onChange={e => setCurrentCollege({...currentCollege, coordinatorPhone: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Programs Modal */}
            {isProgramsModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans text-foreground">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="text-2xl font-black tracking-tight">Registered Programs</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest bg-primary/10 w-fit px-2 py-0.5 rounded text-primary">
                                {currentCollege?.name}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {loadingPrograms ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Fetching programs...</p>
                                </div>
                            ) : collegePrograms.length === 0 ? (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                    <List className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                                    <p className="text-sm text-muted-foreground italic font-medium">No programs registered yet</p>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {collegePrograms.map((program) => (
                                        <Link 
                                            key={program._id} 
                                            href={`/dashboard/events/${program.event}/programs/${program._id}/registrations?collegeId=${currentCollege?._id}`}
                                            className="p-4 bg-muted/40 border border-border rounded-xl hover:border-primary/30 hover:bg-muted/60 transition-all group block"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{program.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                                                            {program.category}
                                                        </span>
                                                        <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                            {program.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsProgramsModalOpen(false)}
                            className="w-full mt-6 px-4 py-3 bg-secondary hover:bg-muted text-foreground border border-border rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search colleges..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">College Name</th>
                                <th className="px-6 py-4">Coordinator</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading colleges...</td></tr>
                            ) : filteredColleges.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No colleges found.</td></tr>
                            ) : (
                                filteredColleges.map((college) => (
                                    <tr key={college._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium">{college.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{college.coordinatorName}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{college.coordinatorPhone}</td>
                                        <td className="px-6 py-4 text-right space-x-1">
                                            <button 
                                                title="View Registered Programs"
                                                onClick={() => { setCurrentCollege(college); fetchCollegePrograms(college._id); }}
                                                className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all"
                                            >
                                                <List className="h-4 w-4" />
                                            </button>
                                            <button 
                                                title="Edit College"
                                                onClick={() => { setCurrentCollege({...college}); setIsEditModalOpen(true); }}
                                                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                title="Delete College"
                                                onClick={() => handleDelete(college._id)}
                                                className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all"
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
