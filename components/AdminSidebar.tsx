"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    School, 
    CalendarDays, 
    Mic2,
    Users, 
    UserCog,
    Trophy, 
    Settings, 
    LogOut,
    CheckSquare,
    FileCheck2,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    setUserRole(res.data.data.role);
                }
            } catch (error) {
                console.error("Failed to fetch user role", error);
            }
        };
        fetchRole();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    
        // { name: 'Events', href: '/dashboard/events', icon: CalendarDays },
        { name: 'Programs', href: '/dashboard/programs', icon: Mic2 },
        
        { name: 'Registration', href: '/dashboard/registration', icon: CheckSquare },
        { name: 'Program Reporting', href: '/dashboard/reporting', icon: FileCheck2 },
        { name: 'Students', href: '/dashboard/students', icon: Users },
        { 
            name: 'Users', 
            href: '/dashboard/users', 
            icon: UserCog,
            adminOnly: true 
        },
        { name: 'Scoring', href: '/dashboard/scoring', icon: Trophy },
       { name: 'Colleges', href: '/dashboard/colleges', icon: School },
        // { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const visibleLinks = links.filter(link => !link.adminOnly || userRole === 'super_admin');

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
                "fixed left-0 top-0 h-screen w-80 bg-[#030712] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
                        <Image 
                            src="/Mes-youth-fest-2.png" 
                            alt="Logo" 
                            width={100} 
                            height={100} 
                            className="object-contain"
                        />
                    </Link>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted lg:hidden"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-3">
                    {visibleLinks.map((link) => {
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
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                                    isActive 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-white")} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
