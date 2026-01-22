"use client";
import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-border bg-card sticky top-0 z-30">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                {/* <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    MES Admin
                </span> */}
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 lg:ml-80 p-4 md:p-8">
                {children}
            </main>
        </div>
    </div>
  );
}
