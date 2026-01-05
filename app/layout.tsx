import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InterFest 2026 - Ultimate Inter-College Championship',
  description: 'Join the biggest inter-college event management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <footer className="bg-black py-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2026 InterFest. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
