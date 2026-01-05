"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    School, 
    CalendarDays, 
    Mic2,
    Users, 
    Trophy, 
    Settings, 
    LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    InterFest Admin
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
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
    );
}
