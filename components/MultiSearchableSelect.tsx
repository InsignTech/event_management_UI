"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    _id: string;
    name: string;
    registrationCode?: string;
}

interface MultiSearchableSelectProps {
    options: Option[];
    value: string[]; // IDs
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
}

export default function MultiSearchableSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Select participants...", 
    label,
    disabled 
}: MultiSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter(opt => value.includes(opt._id));
    
    // Sort options: selected first, then by name
    const sortedOptions = [...options].sort((a, b) => {
        const aSelected = value.includes(a._id);
        const bSelected = value.includes(b._id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.name.localeCompare(b.name);
    });

    const filteredOptions = sortedOptions.filter(opt => 
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.registrationCode && opt.registrationCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const removeOption = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== id));
    };

    return (
        <div className="space-y-1.5 relative" ref={containerRef}>
            {label && <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>}
            
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "min-h-[48px] w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm flex flex-wrap gap-2 items-center transition-all cursor-pointer",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
                    isOpen && "border-primary/50 shadow-lg shadow-primary/5"
                )}
            >
                {selectedOptions.length === 0 && (
                    <span className="text-muted-foreground italic text-xs">{placeholder}</span>
                )}
                {selectedOptions.map(opt => (
                    <span 
                        key={opt._id} 
                        className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/20 animate-in zoom-in-95 duration-200"
                    >
                        {opt.name}
                        <X 
                            className="h-3 w-3 hover:text-primary-foreground hover:bg-primary rounded-full transition-all" 
                            onClick={(e) => removeOption(e, opt._id)}
                        />
                    </span>
                ))}
                <div className="ml-auto flex items-center gap-2">
                    {value.length > 0 && (
                        <span className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black">
                            {value.length}
                        </span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-[110] top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-border bg-muted/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                autoFocus
                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary transition-all shadow-inner"
                                placeholder="Search by name or registration code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-8 text-xs text-muted-foreground italic text-center flex flex-col items-center gap-2">
                                <Search className="h-6 w-6 opacity-10" />
                                No students found
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt._id}
                                    type="button"
                                    onClick={() => toggleOption(opt._id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm hover:bg-primary/5 flex justify-between items-center transition-all group",
                                        value.includes(opt._id) && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className={cn("font-bold transition-colors", value.includes(opt._id) ? "text-primary" : "text-foreground group-hover:text-primary")}>
                                            {opt.name}
                                        </span>
                                        {opt.registrationCode && (
                                            <span className="text-[10px] text-muted-foreground font-mono font-medium">
                                                {opt.registrationCode}
                                            </span>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                                        value.includes(opt._id) ? "bg-primary border-primary scale-110" : "border-border group-hover:border-primary/50"
                                    )}>
                                        {value.includes(opt._id) && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
