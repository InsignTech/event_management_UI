"use client";
import React, { useEffect, useState } from 'react';
import { Shield, Zap } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/lib/toast';

export default function SettingsPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
        fetchRole();
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
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="h-12 w-12" />
                        </div>
                        
                        <div className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Zap className="h-5 w-5 fill-current" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">WhatsApp Reminders</h2>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Sends a automated reminder to all confirmed participants for programs scheduled in the future. Use this sparingly.
                        </p>
                        
                        <button 
                            onClick={handleTriggerReminders}
                            disabled={isTriggering}
                            className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] mt-2"
                        >
                            {isTriggering ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 fill-current" />
                                    Trigger All Reminders
                                </>
                            )}
                        </button>
                    </div>
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
