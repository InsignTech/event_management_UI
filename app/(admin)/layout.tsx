import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8">
            {children}
        </main>
    </div>
  );
}
