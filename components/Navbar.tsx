"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: 'Events', href: '#events' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Login', href: '/login' },
  ];

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
              <Link href="/register" className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full text-primary-foreground font-black text-sm uppercase transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                Register Now
              </Link>
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
            <Link 
              href="/register" 
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-primary text-primary-foreground px-4 py-4 rounded-xl font-black uppercase tracking-tighter mt-4"
            >
              Register Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
