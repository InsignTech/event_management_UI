"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      // Fetch user role
      const fetchUserRole = async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUserRole(res.data.data.role);
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
        }
      };
      fetchUserRole();
    }
  }, [pathname]);

  const isDashboard = pathname.startsWith('/dashboard');

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!userRole) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    const roleRedirects: { [key: string]: string } = {
      'super_admin': '/dashboard',
      'event_admin': '/dashboard',
      'coordinator': '/events',
      'registration': '/dashboard/registration',
      'program_reporting': '/dashboard/reporting',
      'scoring': '/dashboard/scoring',
    };
    
    const redirectPath = roleRedirects[userRole] || '/login';
    router.push(redirectPath);
  };

  const baseMenuItems = [
    { name: 'Results', href: '/results' },
    { name: 'Schedule', href: '/#schedule' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  // Logic to show/hide Dashboard/Home in menu based on where we are
  const menuItems = isLoggedIn 
    ? [...baseMenuItems, isDashboard ? { name: 'Home', href: '/' } : { name: 'Dashboard', href: '/dashboard' }]
    : baseMenuItems;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-border/50">
      <div className="px-4 sm:px-6"> 
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/Mes-youth-fest-2.png" 
                alt="MES Youth Fest Logo" 
                width={120} 
                height={60} 
                className="object-contain h-12 w-auto"
                priority
              />
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors uppercase tracking-wider"
                >
                  {item.name}
                </Link>
              ))}
              {isLoggedIn && (
                isDashboard ? (
                  <Link href="/" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full text-primary-foreground font-black text-sm uppercase transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                    Go to Home
                  </Link>
                ) : (
                  <button 
                    onClick={handleDashboardClick}
                    className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full text-primary-foreground font-black text-sm uppercase transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
                  >
                    Go to Dashboard
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-border animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-bold text-foreground/80 hover:text-primary hover:bg-muted transition-all uppercase tracking-widest"
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn && (
              isDashboard ? (
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-4 rounded-xl font-black uppercase tracking-tighter mt-4"
                >
                  Go to Home
                </Link>
              ) : (
                <button 
                  onClick={(e) => {
                    handleDashboardClick(e);
                    setIsOpen(false);
                  }}
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-4 rounded-xl font-black uppercase tracking-tighter mt-4"
                >
                  Go to Dashboard
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
