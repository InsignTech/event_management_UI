"use client";
import React, { useEffect, useState } from 'react';
import { Shield, Zap, Bell, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { toast, showError, showSuccess } from '@/lib/toast';
import SearchableSelect from '@/components/SearchableSelect';

interface Program {
    _id: string;
    name: string;
    category: string;
    startTime: string;
    venue: string;
}

export default function SettingsPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);
    const [isSingleTriggering, setIsSingleTriggering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');

    useEffect(() => {
        const fetchRole = async () => {
            try {
                setIsLoading(true);
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    setUserRole(res.data.data.role);
                }
            } catch (error) {
                console.error("Failed to fetch user role", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPrograms = async () => {
            try {
                const res = await api.get('/programs?includeCancelled=false');
                if (res.data.success) {
                    const now = new Date();
                    const upcoming = res.data.data.filter((p: Program) => new Date(p.startTime) > now);
                    setPrograms(upcoming);
                }
            } catch (error) {
                console.error("Failed to fetch programs", error);
            }
        };

        fetchRole();
        fetchPrograms();
    }, []);

    const handleTriggerReminders = async () => {
        if (!confirm('Are you sure you want to trigger WhatsApp reminders for all future programs? This will send messages to all confirmed participants.')) {
            return;
        }

        try {
            setIsTriggering(true);
            const res = await api.post('/programs/trigger/reminders');
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error: any) {
            console.error("Failed to trigger reminders", error);
            const message = error.response?.data?.message || "Failed to trigger reminders";
            toast.error(message);
        } finally {
            setIsTriggering(false);
        }
    };

    const handleTriggerSingleReminder = async () => {
        if (!selectedProgramId) {
            toast.error("Please select a program first");
            return;
        }

        const program = programs.find(p => p._id === selectedProgramId);
        if (!confirm(`Are you sure you want to send WhatsApp reminders for "${program?.name}"?`)) {
            return;
        }

        try {
            setIsSingleTriggering(true);
            const res = await api.post(`/programs/${selectedProgramId}/reminder`);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error: any) {
            showError(error);
        } finally {
            setIsSingleTriggering(false);
        }
    };

    const isSuperAdmin = userRole?.toLowerCase() === 'super_admin';

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">System Tools</h1>
                    <p className="text-muted-foreground text-sm">Administrative controls and notification triggers.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20">
                    System Administration
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isSuperAdmin ? (
                    <>
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="h-12 w-12" />
                            </div>

                            <div className="flex items-center gap-3 text-primary">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Zap className="h-5 w-5 fill-current" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Bulk Reminders</h2>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Sends an automated reminder for <strong>ALL</strong> confirmed participants of <strong>ALL</strong> future programs.
                            </p>

                            <button
                                onClick={handleTriggerReminders}
                                disabled={isTriggering}
                                className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
                            >
                                {isTriggering ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                                        Sending Bulk...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 fill-current" />
                                        Trigger All Future Reminders
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm relative overflow-hidden group lg:col-span-2">
                            <div className="flex items-center gap-3 text-foreground">
                                <div className="p-2 bg-secondary rounded-lg">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Specific Program Reminder</h2>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Select a specific upcoming program to send WhatsApp reminders to its participants and coordinators.
                            </p>

                            <div className="pt-2">
                                <SearchableSelect
                                    label="Search Program"
                                    options={programs.map(p => ({ _id: p._id, name: `${p.name} (${new Date(p.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })})` }))}
                                    value={selectedProgramId}
                                    onChange={setSelectedProgramId}
                                    placeholder="Select an upcoming program..."
                                />
                            </div>

                            <button
                                onClick={handleTriggerSingleReminder}
                                disabled={isSingleTriggering || !selectedProgramId}
                                className="w-full py-3 bg-[#25D366] text-white hover:bg-[#22c35e] rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] mt-2"
                            >
                                {isSingleTriggering ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Sending WhatsApps...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="h-4 w-4 fill-current" />
                                        Send Program Reminder
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px] border-dashed">
                        <div className="p-4 bg-muted rounded-full">
                            <Shield className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Access Restricted</p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">Only users with the Super Admin role can access these system tools.</p>
                        </div>
                        <div className="text-[10px] px-2 py-0.5 bg-muted rounded font-mono text-muted-foreground uppercase">
                            Your Role: {userRole || 'Guest'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
