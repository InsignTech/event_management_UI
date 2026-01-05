"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { showError, showSuccess } from '@/lib/toast';

interface Event {
    _id: string;
    name: string;
    description?: string;
    venue: string;
    startDate: string;
    endDate: string;
    status: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        venue: '',
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            if (res.data.success) {
                setEvents(res.data.data);
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
            const res = await api.post('/events', newEvent);
            if (res.data.success) {
                showSuccess('Event created successfully');
                setIsModalOpen(false);
                setNewEvent({
                    name: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    venue: '',
                });
                fetchEvents();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentEvent) return;
        try {
            const res = await api.put(`/events/${currentEvent._id}`, currentEvent);
            if (res.data.success) {
                showSuccess('Event updated successfully');
                setIsEditModalOpen(false);
                fetchEvents();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? This will also remove associated programs and registrations.')) return;
        try {
            const res = await api.delete(`/events/${id}`);
            if (res.data.success) {
                showSuccess('Event deleted successfully');
                fetchEvents();
            }
        } catch (error) {
            showError(error);
        }
    };

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Events</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create Event
                </button>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Event Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newEvent.name}
                                    onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Description</label>
                                <textarea 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-primary"
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Start Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newEvent.startDate}
                                        onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">End Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newEvent.endDate}
                                        onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Main Venue</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newEvent.venue}
                                    onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
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
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Event Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentEvent.name}
                                    onChange={e => setCurrentEvent({...currentEvent, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Description</label>
                                <textarea 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] outline-none focus:border-primary"
                                    value={currentEvent.description || ''}
                                    onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Start Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentEvent.startDate.split('T')[0]}
                                        onChange={e => setCurrentEvent({...currentEvent, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">End Date</label>
                                    <input 
                                        required
                                        type="date"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentEvent.endDate.split('T')[0]}
                                        onChange={e => setCurrentEvent({...currentEvent, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Main Venue</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentEvent.venue}
                                    onChange={e => setCurrentEvent({...currentEvent, venue: e.target.value})}
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
                    placeholder="Search events..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading events...</p>
                ) : filteredEvents.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">No events found.</p>
                ) : (
                    filteredEvents.map((event) => (
                        <div key={event._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs border truncate ${
                                    event.status === 'upcoming' 
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                                        : event.status === 'ongoing'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                }`}>
                                    {event.status}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 truncate">{event.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4 truncate">{event.venue}</p>
                            <div className="text-xs text-muted-foreground space-y-1 mb-4">
                                <p>Start: {new Date(event.startDate).toLocaleDateString()}</p>
                                <p>End: {new Date(event.endDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-border">
                                <Link 
                                    href={`/dashboard/events/${event._id}/programs`}
                                    className="flex-1 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-center"
                                >
                                    Manage
                                </Link>
                                <button 
                                    onClick={() => { setCurrentEvent(event); setIsEditModalOpen(true); }}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(event._id)}
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
