"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    School, 
    CalendarDays, 
    Mic2,
    Users, 
    Trophy, 
    Settings, 
    LogOut,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Colleges', href: '/dashboard/colleges', icon: School },
        { name: 'Events', href: '/dashboard/events', icon: CalendarDays },
        { name: 'Programs', href: '/dashboard/programs', icon: Mic2 },
        { name: 'Students', href: '/dashboard/students', icon: Users },
        { name: 'Scoring', href: '/dashboard/scoring', icon: Trophy },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
                        <Image 
                            src="/Mes-youth-fest-2.png" 
                            alt="Logo" 
                            width={100} 
                            height={100} 
                            className="object-contain"
                        />
                        {/* <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            MES Admin
                        </span> */}
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted lg:hidden"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive 
                                        ? "bg-purple-500/10 text-purple-400" 
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
