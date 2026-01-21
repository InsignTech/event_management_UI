"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    _id: string;
    name: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "Select...", label, disabled }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when disabled
    useEffect(() => {
        if (disabled && isOpen) setIsOpen(false);
    }, [disabled, isOpen]);

    const selectedOption = options.find(opt => opt._id === value);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            {label && <label className="text-xs text-muted-foreground">{label}</label>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm flex justify-between items-center transition-colors",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"
                )}
            >
                <span className={cn(!selectedOption && "text-muted-foreground")}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-60">
                    <div className="p-2 border-b border-border bg-muted/50">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <input
                                autoFocus
                                className="w-full bg-background border border-border rounded-md pl-7 pr-2 py-1 text-xs outline-none focus:border-primary"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground italic text-center">No results found</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt._id}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt._id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 flex justify-between items-center transition-colors"
                                >
                                    {opt.name}
                                    {value === opt._id && <Check className="h-4 w-4 text-primary" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
