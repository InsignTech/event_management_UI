"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import { showError, showSuccess } from '@/lib/toast';

interface Student {
    _id: string;
    name?: string;
    universityRegNo: string;
    course: string;
    year: string;
    gender: string;
    college: {
        _id: string;
        name: string;
    };
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollege, setSelectedCollege] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 1
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState<any>(null);
    const [colleges, setColleges] = useState<{_id: string, name: string}[]>([]);
    const [newStudent, setNewStudent] = useState({
        name: '',
        universityRegNo: '',
        course: '',
        year: '1',
        gender: 'male',
        college: '',
    });

    useEffect(() => {
        fetchColleges();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStudents(1); // Reset to page 1 on search or filter change
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCollege]);

    useEffect(() => {
        fetchStudents(page);
    }, [page]);

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

    const fetchStudents = async (targetPage = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/students', {
                params: {
                    college: selectedCollege || undefined,
                    search: searchTerm || undefined,
                    page: targetPage,
                    limit: 20
                }
            });
            if (res.data.success) {
                setStudents(res.data.data);
                setPagination(res.data.pagination);
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
            const res = await api.post('/students', newStudent);
            if (res.data.success) {
                showSuccess('Student registered successfully');
                setIsModalOpen(false);
                setNewStudent({
                    name: '',
                    universityRegNo: '',
                    course: '',
                    year: '1',
                    gender: 'male',
                    college: '',
                });
                fetchStudents();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStudent) return;
        try {
            const updateData = {
                ...currentStudent,
                college: typeof currentStudent.college === 'object' ? currentStudent.college._id : currentStudent.college
            };
            const res = await api.put(`/students/${currentStudent._id}`, updateData);
            if (res.data.success) {
                showSuccess('Student updated successfully');
                setIsEditModalOpen(false);
                fetchStudents();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const res = await api.delete(`/students/${id}`);
            if (res.data.success) {
                showSuccess('Student deleted successfully');
                fetchStudents();
            }
        } catch (error) {
            showError(error);
        }
    };

    // Backend-driven results
    const filteredStudents = students;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">Students</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Register Student
                </button>
            </div>

            {/* Register Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Register New Student</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Student Name (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newStudent.name}
                                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">University Reg No</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={newStudent.universityRegNo}
                                    onChange={e => setNewStudent({...newStudent, universityRegNo: e.target.value})}
                                />
                            </div>
                            <SearchableSelect 
                                label="College"
                                options={colleges}
                                value={newStudent.college}
                                onChange={val => setNewStudent({...newStudent, college: val})}
                                placeholder="Select College"
                            />
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Course (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    placeholder="e.g. BCA, B.Sc Computer Science"
                                    value={newStudent.course}
                                    onChange={e => setNewStudent({...newStudent, course: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Year</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newStudent.year}
                                        onChange={e => setNewStudent({...newStudent, year: e.target.value})}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Gender</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={newStudent.gender}
                                        onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
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
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && currentStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit Student</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Student Name (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentStudent.name || ''}
                                    onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">University Reg No</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentStudent.universityRegNo}
                                    onChange={e => setCurrentStudent({...currentStudent, universityRegNo: e.target.value})}
                                />
                            </div>
                            <SearchableSelect 
                                label="College"
                                options={colleges}
                                value={typeof currentStudent.college === 'object' ? currentStudent.college._id : currentStudent.college}
                                onChange={val => setCurrentStudent({...currentStudent, college: val})}
                                placeholder="Select College"
                            />
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Course (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={currentStudent.course}
                                    onChange={e => setCurrentStudent({...currentStudent, course: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Year</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentStudent.year}
                                        onChange={e => setCurrentStudent({...currentStudent, year: e.target.value})}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Gender</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={currentStudent.gender}
                                        onChange={e => setCurrentStudent({...currentStudent, gender: e.target.value})}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
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


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                    <SearchableSelect 
                        label="Filter by College"
                        options={[{_id: '', name: 'All Colleges'}, ...colleges]}
                        value={selectedCollege}
                        onChange={val => {
                            setSelectedCollege(val);
                            setPage(1);
                        }}
                        placeholder="Select College"
                    />
                </div>
                <div className="flex items-end">
                    <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg w-full h-[42px]">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search by Reg No, Name, Course..." 
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">University Reg No</th>
                                <th className="px-6 py-4">Course & Year</th>
                                <th className="px-6 py-4">College</th>
                                <th className="px-6 py-4">Gender</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading students...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No students found.</td></tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium">{student.name || <span className="text-muted-foreground italic text-xs">N/A</span>}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{student.universityRegNo}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{student.course}</span>
                                                <span className="text-xs text-muted-foreground">{student.year} Year</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.college?.name}</td>
                                        <td className="px-6 py-4 capitalize">{student.gender}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => { setCurrentStudent({...student}); setIsEditModalOpen(true); }}
                                                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(student._id)}
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

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 text-xs font-bold border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.pages <= 5) pageNum = i + 1;
                                else if (pagination.page <= 3) pageNum = i + 1;
                                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                else pageNum = pagination.page - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                                            pagination.page === pageNum 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'border border-border hover:bg-muted'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 text-xs font-bold border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
