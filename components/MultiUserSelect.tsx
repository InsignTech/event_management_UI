"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface MultiUserSelectProps {
    value: string[]; // IDs
    initialData?: User[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
}

export default function MultiUserSelect({ value, initialData = [], onChange, placeholder = "Select coordinators...", label }: MultiUserSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [selectedUsers, setSelectedUsers] = useState<User[]>(initialData);

    useEffect(() => {
        if (initialData.length > 0 && selectedUsers.length === 0) {
            setSelectedUsers(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchTerm.trim()) {
                setOptions([]);
                return;
            }
            setLoading(true);
            try {
                const res = await api.get(`/users/search?q=${searchTerm}`);
                if (res.data.success) {
                    setOptions(res.data.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleUser = (user: User) => {
        const isSelected = value.includes(user._id);
        if (isSelected) {
            onChange(value.filter(id => id !== user._id));
            setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
        } else {
            onChange([...value, user._id]);
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const removeUser = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        onChange(value.filter(id => id !== userId));
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
    };

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            {label && <label className="text-xs text-muted-foreground font-medium">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="min-h-[42px] w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm flex flex-wrap gap-1.5 items-center hover:border-primary/50 transition-colors cursor-pointer"
            >
                {selectedUsers.length === 0 && (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                {selectedUsers.map(user => (
                    <span key={user._id} className="inline-flex items-center gap-1 bg-primary/20 text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10">
                        {user.name}
                        <X 
                            className="h-3 w-3 hover:text-white cursor-pointer" 
                            onClick={(e) => removeUser(e, user._id)}
                        />
                    </span>
                ))}
                <div className="ml-auto">
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[60] top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-64">
                    <div className="p-2 border-b border-border bg-muted/50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <input
                                autoFocus
                                className="w-full bg-background border border-border rounded-md pl-7 pr-2 py-1.5 text-xs outline-none focus:border-primary"
                                placeholder="Type to search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                        {loading ? (
                            <div className="px-3 py-4 text-xs text-muted-foreground text-center animate-pulse">Searching...</div>
                        ) : options.length === 0 ? (
                            <div className="px-3 py-4 text-xs text-muted-foreground italic text-center">
                                {searchTerm ? "No users found" : "Start typing to find coordinators"}
                            </div>
                        ) : (
                            options.map((user) => (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => toggleUser(user)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex justify-between items-center transition-colors border-b border-border/10 last:border-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold">{user.name}</span>
                                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                    </div>
                                    {value.includes(user._id) && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
