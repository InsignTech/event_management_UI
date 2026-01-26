"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Mic2, Tv, Users } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { showError, showSuccess } from '@/lib/toast';
import MultiUserSelect from '@/components/MultiUserSelect';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Program {
    _id: string;
    name: string;
    type: 'single' | 'group';
    category: 'on_stage' | 'off_stage';
    venue: string;
    startTime: string;
    duration: number;
    coordinators?: User[];
}

export default function EventProgramsPage() {
    const params = useParams();
    const eventId = params.id;
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentProgram, setCurrentProgram] = useState<Program | null>(null);

    const [newProgram, setNewProgram] = useState({
        name: '',
        type: 'single',
        category: 'on_stage',
        venue: '',
        startTime: '',
        duration: 0,
        coordinators: [] as string[]
    });

    useEffect(() => {
        if (eventId) fetchPrograms();
    }, [eventId]);

    const fetchPrograms = async () => {
        try {
            const res = await api.get(`/programs/event/${eventId}`);
            if (res.data.success) {
                setPrograms(res.data.data);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/programs', { ...newProgram, event: eventId });
            if (res.data.success) {
                showSuccess('Program created successfully');
                setIsModalOpen(false);
                setNewProgram({
                    name: '',
                    type: 'single',
                    category: 'on_stage',
                    venue: '',
                    startTime: '',
                    duration: 0,
                    coordinators: []
                });
                fetchPrograms();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProgram) return;
        try {
            // Map coordinators to IDs only before sending to backend
            const updateData = {
                ...currentProgram,
                coordinators: currentProgram.coordinators?.map(u => typeof u === 'string' ? u : u._id)
            };
            const res = await api.put(`/programs/${currentProgram._id}`, updateData);
            if (res.data.success) {
                showSuccess('Program updated successfully');
                setIsEditModalOpen(false);
                fetchPrograms();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this program? This will also remove all registrations for it.')) return;
        try {
            const res = await api.delete(`/programs/${id}`);
            if (res.data.success) {
                showSuccess('Program deleted successfully');
                fetchPrograms();
            }
        } catch (error) {
            showError(error);
        }
    };

    const filteredPrograms = programs.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/events" className="hover:text-primary">Events</Link>
                <span>/</span>
                <span className="text-foreground font-medium">Programs</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Programs</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Program
                </button>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Create New Program</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Program Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newProgram.name}
                                    onChange={e => setNewProgram({...newProgram, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Type</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newProgram.type}
                                        onChange={e => setNewProgram({...newProgram, type: e.target.value as any})}
                                    >
                                        <option value="single">Single</option>
                                        <option value="group">Group</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Category</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newProgram.category}
                                        onChange={e => setNewProgram({...newProgram, category: e.target.value as any})}
                                    >
                                        <option value="on_stage">On Stage</option>
                                        <option value="off_stage">Off Stage</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Venue</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newProgram.venue}
                                    onChange={e => setNewProgram({...newProgram, venue: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Start Time</label>
                                    <input 
                                        required
                                        type="datetime-local"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newProgram.startTime}
                                        onChange={e => setNewProgram({...newProgram, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Duration (mins)</label>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newProgram.duration}
                                        onChange={e => setNewProgram({...newProgram, duration: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <MultiUserSelect 
                                    label="Program Coordinators (Optional)"
                                    value={newProgram.coordinators}
                                    onChange={ids => setNewProgram({...newProgram, coordinators: ids})}
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
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentProgram && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit Program</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Program Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentProgram.name}
                                    onChange={e => setCurrentProgram({...currentProgram, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Type</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentProgram.type}
                                        onChange={e => setCurrentProgram({...currentProgram, type: e.target.value as any})}
                                    >
                                        <option value="single">Single</option>
                                        <option value="group">Group</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Category</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentProgram.category}
                                        onChange={e => setCurrentProgram({...currentProgram, category: e.target.value as any})}
                                    >
                                        <option value="on_stage">On Stage</option>
                                        <option value="off_stage">Off Stage</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Venue</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentProgram.venue}
                                    onChange={e => setCurrentProgram({...currentProgram, venue: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Start Time</label>
                                    <input 
                                        required
                                        type="datetime-local"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={new Date(currentProgram.startTime).toISOString().slice(0, 16)}
                                        onChange={e => setCurrentProgram({...currentProgram, startTime: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Duration (mins)</label>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentProgram.duration}
                                        onChange={e => setCurrentProgram({...currentProgram, duration: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <MultiUserSelect 
                                    label="Program Coordinators"
                                    value={currentProgram.coordinators?.map(u => typeof u === 'string' ? u : u._id) || []}
                                    initialData={currentProgram.coordinators || []}
                                    onChange={ids => setCurrentProgram({...currentProgram, coordinators: ids as any})}
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


            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search programs..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading programs...</p>
                ) : filteredPrograms.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">No programs found for this event.</p>
                ) : (
                    filteredPrograms.map((program) => (
                        <div key={program._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    {program.category === 'on_stage' ? <Mic2 className="h-6 w-6" /> : <Tv className="h-6 w-6" />}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                        program.type === 'single' 
                                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    }`}>
                                        {program.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                        program.category === 'on_stage' 
                                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
                                            : 'bg-teal-500/10 text-teal-500 border-teal-500/20'
                                    }`}>
                                        {program.category.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-1 truncate">{program.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4 truncate">{program.venue}</p>
                            
                            {program.coordinators && program.coordinators.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                        <Users className="h-3 w-3" />
                                        <span>Coordinators</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {program.coordinators.map(user => (
                                            <span key={user._id} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full border border-border">
                                                {user.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground space-y-1 mb-4">
                                <p>Start: {new Date(program.startTime).toLocaleString()}</p>
                                {/* <p>Duration: {program.duration} mins</p> */}
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-border">
                                <Link 
                                    href={`/dashboard/events/${eventId}/programs/${program._id}/registrations`}
                                    className="flex-1 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors text-center"
                                >
                                    Registrations
                                </Link>
                                <button 
                                    onClick={() => { setCurrentProgram({...program}); setIsEditModalOpen(true); }}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(program._id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
