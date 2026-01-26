"use client";
import React, { useEffect, useState } from 'react';
import { Search, ClipboardCheck } from 'lucide-react';
import api from '@/lib/api';
import { showError } from '@/lib/toast';
import Link from 'next/link';

interface College {
    _id: string;
    name: string;
    coordinatorName: string;
    coordinatorPhone: string;
}

export default function RegistrationLandingPage() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredColleges = colleges.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-black tracking-tight">Registration Management</h1>
                <p className="text-sm text-muted-foreground">Select a college to manage their program registrations</p>
            </div>

            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-xl max-w-md shadow-sm focus-within:border-primary/50 transition-all">
                <Search className="h-4 w-4 text-muted-foreground mr-3" />
                <input 
                    type="text" 
                    placeholder="Search colleges..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-5">College Name</th>
                                <th className="px-6 py-5">Coordinator</th>
                                <th className="px-6 py-5">Contact</th>
                                <th className="px-6 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                        <span className="animate-pulse">Loading colleges...</span>
                                    </div>
                                </td></tr>
                            ) : filteredColleges.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">No colleges found.</td></tr>
                            ) : (
                                filteredColleges.map((college) => (
                                    <tr key={college._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-foreground group-hover:text-primary transition-colors">{college.name}</td>
                                        <td className="px-6 py-5 text-muted-foreground font-medium">{college.coordinatorName}</td>
                                        <td className="px-6 py-5 text-muted-foreground font-mono text-xs">{college.coordinatorPhone}</td>
                                        <td className="px-6 py-5 text-right">
                                            <Link 
                                                href={`/dashboard/registration/${college._id}`}
                                                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-[0.98] shadow-sm"
                                            >
                                                <ClipboardCheck className="h-3.5 w-3.5" />
                                                Manage Registrations
                                            </Link>
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
