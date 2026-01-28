import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MES Youth Fest',
  description: 'Join the biggest inter-college event management platform.',
  icons: {
    icon: '/cropped-c1494ae0-e4e0-4f74-bfdc-a1f41d30c62e_removalai_preview-32x32.png',
  },

  openGraph: {
    title: 'MES Youth Fest',
    description: 'Join the biggest inter-college event management platform.',
    type: 'website',
    images: [
      {
        url: 'https://mesyouthfest.org/Mes-youth-fest-2.png',
        alt: 'MES Youth Fest',
      },
    ],
  },

  twitter: {
    card: 'summary',
    title: 'MES Youth Fest',
    description: 'Join the biggest inter-college event management platform.',
    images: [
      'https://mesyouthfest.org/Mes-youth-fest-2.png',
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        {/* <footer className="bg-black py-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
            <p>&copy; 2026 MES Youth Fest. All rights reserved.</p>
          </div>
        </footer> */}
      </body>
    </html>
  );
}
