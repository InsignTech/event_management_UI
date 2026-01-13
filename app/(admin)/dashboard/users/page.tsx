"use client";
import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, UserCog, Mail, Phone, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'coordinator',
        phone: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            if (res.data.success) {
                setUsers(res.data.data);
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
            const res = await api.post('/users', formData);
            if (res.data.success) {
                showSuccess('User created successfully');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'coordinator', phone: '' });
                fetchUsers();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        try {
            // Only send password if it's provided
            const updateData: any = { ...formData };
            if (!updateData.password) delete updateData.password;
            
            const res = await api.put(`/users/${currentUser._id}`, updateData);
            if (res.data.success) {
                showSuccess('User updated successfully');
                setIsEditModalOpen(false);
                fetchUsers();
            }
        } catch (error) {
            showError(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this user? This is a soft delete.')) return;
        try {
            const res = await api.delete(`/users/${id}`);
            if (res.data.success) {
                showSuccess('User removed successfully');
                fetchUsers();
            }
        } catch (error) {
            showError(error);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button 
                    onClick={() => {
                        setFormData({ name: '', email: '', password: '', role: 'coordinator', phone: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Create User
                </button>
            </div>

            <div className="flex items-center px-4 py-2 bg-card border border-border rounded-lg max-w-md">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">No users found.</p>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${
                                    user.role === 'super_admin' 
                                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                        : user.role === 'event_admin'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-3">{user.name}</h3>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-border">
                                <button 
                                    onClick={() => {
                                        setCurrentUser(user);
                                        setFormData({
                                            name: user.name,
                                            email: user.email,
                                            password: '',
                                            role: user.role,
                                            phone: user.phone || ''
                                        });
                                        setIsEditModalOpen(true);
                                    }}
                                    className="flex-1 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(user._id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Create New User</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Full Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Email Address</label>
                                <input 
                                    required
                                    type="email"
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Password</label>
                                    <input 
                                        required
                                        type="password"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Role</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="coordinator">Coordinator</option>
                                        <option value="event_admin">Event Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Phone (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
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
            {isEditModalOpen && currentUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Full Name</label>
                                <input 
                                    required
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Email Address</label>
                                <input 
                                    required
                                    type="email"
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">New Password (Optional)</label>
                                    <input 
                                        type="password"
                                        placeholder="Leave blank to keep same"
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Role</label>
                                    <select 
                                        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="coordinator">Coordinator</option>
                                        <option value="event_admin">Event Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Phone (Optional)</label>
                                <input 
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
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
        </div>
    );
}
