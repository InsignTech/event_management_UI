"use client";
import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <Shield className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Security</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Manage your password and authentication settings.</p>
                    <button className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                        Change Password
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <Bell className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Notifications</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Configure how you receive alerts and updates.</p>
                    <button className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                        Notification Settings
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <Database className="h-5 w-5" />
                        <h2 className="text-xl font-bold">General</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">System-wide configurations and data management.</p>
                    <button className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                        System Configuration
                    </button>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <Globe className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Backup</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">Export data or manage database backups.</p>
                    <button className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors">
                        Export All Data
                    </button>
                </div>
            </div>
        </div>
    );
}
