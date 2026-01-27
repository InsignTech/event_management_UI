"use client";
import React, { useEffect, useState } from 'react';
import { FileDown, FileCheck2, School, Mic2, Users, ReceiptText } from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import SearchableSelect from '@/components/SearchableSelect';

interface Program {
    _id: string;
    name: string;
    category: string;
}

type ExportType = 'college' | 'program' | 'distinct' | 'non-distinct';

export default function ReportsPage() {
    const { userRole } = useRoleAccess({ allowedRoles: ['super_admin', 'event_admin', 'coordinator', 'registration', 'program_reporting'] });
    const [programs, setPrograms] = useState<Program[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userRole) {
            fetchPrograms();
        }
    }, [userRole]);

    const fetchPrograms = async () => {
        try {
            const res = await api.get('/programs');
            if (res.data.success) {
                setPrograms(res.data.data);
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleExport = async (type: ExportType) => {
        if (type === 'program' && !selectedProgramId) {
            showError('Please select a program first');
            return;
        }

        try {
            setLoading(true);
            let url = '';
            let filename = '';

            switch (type) {
                case 'college':
                    url = '/exports/college-wise';
                    filename = 'college_wise_registrations.xlsx';
                    break;
                case 'program':
                    url = `/exports/program-wise/${selectedProgramId}`;
                    const selectedProgram = programs.find(p => p._id === selectedProgramId);
                    filename = `${selectedProgram?.name || 'program'}_registrations.xlsx`;
                    break;
                case 'distinct':
                    url = '/exports/participants-distinct';
                    filename = 'college_wise_distinct_participants.xlsx';
                    break;
                case 'non-distinct':
                    url = '/exports/participants-non-distinct';
                    filename = 'college_wise_total_entries.xlsx';
                    break;
            }
            
            const res = await api.get(url, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            showSuccess('Export started');
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileCheck2 className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
                </div>
                <p className="text-muted-foreground ml-13">Generate and download comprehensive registration data in Excel format.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* College-wise Report Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:border-primary/20 transition-all group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                            <School className="h-8 w-8 text-blue-500" />
                        </div>
                        <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Global Report</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3">College-wise Report</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                        Download a complete summary of all registrations grouped by college. This include participant names, registration codes, program details, and current status.
                    </p>

                    <button 
                        onClick={() => handleExport('college')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown className="h-5 w-5" />
                        )}
                        Export College-wise Excel
                    </button>
                </div>

                {/* Program-wise Report Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:border-primary/20 transition-all group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                            <Mic2 className="h-8 w-8 text-purple-500" />
                        </div>
                        <span className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Specific Report</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3">Program-wise Report</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        Select a specific program to generate a detailed report of its registrations. Includes chest numbers, participant names, and college details.
                    </p>
                    
                    <div className="space-y-4 mb-8 flex-1">
                        <SearchableSelect 
                            label="Search Program"
                            options={programs.map(p => ({ _id: p._id, name: `${p.name} (${p.category})` }))}
                            value={selectedProgramId}
                            onChange={setSelectedProgramId}
                            placeholder="Type to search programs..."
                        />
                    </div>

                    <button 
                        onClick={() => handleExport('program')}
                        disabled={loading || !selectedProgramId}
                        className="w-full flex items-center justify-center gap-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-purple-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown className="h-5 w-5" />
                        )}
                        Export Program-wise Excel
                    </button>
                </div>

                {/* Distinct Participants Report Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:border-primary/20 transition-all group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                            <Users className="h-8 w-8 text-emerald-500" />
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Analytics</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3">Distinct Participants</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                        Count unique individuals representing each college. A participant is counted only once regardless of how many programs they are registered for.
                    </p>

                    <button 
                        onClick={() => handleExport('distinct')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown className="h-5 w-5" />
                        )}
                        Export Distinct Counts
                    </button>
                </div>

                {/* Non-Distinct Participants Report Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:border-primary/20 transition-all group">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                            <ReceiptText className="h-8 w-8 text-amber-500" />
                        </div>
                        <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Analytics</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3">Total Entries</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">
                        Count all participant entries across all programs. If one participant is registered for 3 programs, they contribute 3 to the total count.
                    </p>

                    <button 
                        onClick={() => handleExport('non-distinct')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-amber-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown className="h-5 w-5" />
                        )}
                        Export Total Entries
                    </button>
                </div>
            </div>


            <div className="bg-secondary/30 border border-border rounded-2xl p-6 mt-8">
                <div className="flex gap-4">
                    <div className="mt-1">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                            <FileCheck2 className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Note on Exports</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Reports are generated in real-time based on the current system state. If you have just made changes to registrations or scoring, please allow a few seconds for the data to be fully processed before exporting.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
