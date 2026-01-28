"use client";
import React, { useEffect, useState } from 'react';
import { FileDown, FileCheck2, School, Mic2, Users, ReceiptText, Trophy } from 'lucide-react';

import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import SearchableSelect from '@/components/SearchableSelect';

interface Program {
    _id: string;
    name: string;
    category: string;
}

type ExportType = 'college' | 'program' | 'distinct' | 'non-distinct' | 'student-ranking';

export default function ReportsPage() {
    const { userRole } = useRoleAccess({ allowedRoles: ['super_admin', 'event_admin', 'coordinator', 'registration', 'program_reporting'] });
    const [programs, setPrograms] = useState<Program[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedGender, setSelectedGender] = useState('all');
    const [loading, setLoading] = useState(false);

    const statuses = [
        { value: 'all', label: 'All Statuses' },
        { value: 'open', label: 'Open' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'reported', label: 'Reported' },
        { value: 'participated', label: 'Participated' },
        // { value: 'absent', label: 'Absent' },
        // { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        // { value: 'rejected', label: 'Rejected' },
    ];

    const genders = [
        { value: 'all', label: 'All Genders' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];


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

            const params = new URLSearchParams();
            if (selectedStatus !== 'all') {
                params.append('status', selectedStatus);
            }
            if (selectedGender !== 'all') {
                params.append('gender', selectedGender);
            }

            switch (type) {
                case 'college':
                    url = `/exports/college-wise?${params.toString()}`;
                    filename = `college_wise_registrations_${selectedStatus}.xlsx`;
                    break;
                case 'program':
                    url = `/exports/program-wise/${selectedProgramId}?${params.toString()}`;
                    const selectedProgram = programs.find(p => p._id === selectedProgramId);
                    filename = `${selectedProgram?.name || 'program'}_registrations_${selectedStatus}.xlsx`;
                    break;
                case 'distinct':
                    url = `/exports/participants-distinct?${params.toString()}`;
                    filename = `college_wise_distinct_participants_${selectedStatus}.xlsx`;
                    break;
                case 'non-distinct':
                    url = `/exports/participants-non-distinct?${params.toString()}`;
                    filename = `college_wise_total_entries_${selectedStatus}.xlsx`;
                    break;
                case 'student-ranking':
                    url = `/exports/student-ranking?${params.toString()}`;
                    filename = `student_individual_ranking_${selectedGender}.xlsx`;
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

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Report Filters</h3>
                    <p className="text-xs text-muted-foreground">Apply filters to refine your data exports.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="w-full md:w-48">
                        <label className="text-xs font-bold mb-1.5 block">Registration Status</label>
                        <div className="relative">
                            <select 
                                value={selectedStatus} 
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            >
                                {statuses.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-xs font-bold mb-1.5 block">Gender Filter</label>
                        <div className="relative">
                            <select 
                                value={selectedGender} 
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="w-full h-12 bg-secondary border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            >
                                {genders.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Student Ranking Card */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col h-full hover:border-primary/20 transition-all group lg:col-span-3 border-primary/10 bg-primary/5">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                            <Trophy className="h-8 w-8 text-primary" />
                        </div>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic">Rankings Report</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3">Individual Student Ranking</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                        Generate a comprehensive ranking for the <strong>Individual Champion (Kalathilakam/Kalaprathibha)</strong>. This report only includes <strong>Single Programs</strong> and ignores group items. Points are calculated as: 1st (5pts), 2nd (3pts), and 3rd (1pt).
                    </p>

                    <button 
                        onClick={() => handleExport('student-ranking')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FileDown className="h-5 w-5" />
                        )}
                        Export Student Ranking Excel
                    </button>
                </div>
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
