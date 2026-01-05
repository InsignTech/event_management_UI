"use client";
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-radial-gradient">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 text-center py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold pb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x text-balance">
          Ignite Your Passion. <br /> Conquer the Stage.
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          The most anticipated Inter-College Championship is here. Join thousands of students in an epic battle of talent, skill, and glory.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="px-8 py-4 bg-purple-600 rounded-full text-white font-bold hover:bg-purple-700 transition shadow-lg hover:shadow-purple-500/50">
              Explore Events
            </Link>
            <Link href="/login" className="px-8 py-4 bg-transparent border border-gray-600 rounded-full text-gray-300 font-bold hover:border-white hover:text-white transition">
              Admin Login
            </Link>
        </div>
      </section>

      {/* Features/Stats Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition duration-300">
             <h3 className="text-2xl font-bold text-white mb-2">50+ Colleges</h3>
             <p className="text-gray-400">Competing for the ultimate championship trophy.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition duration-300">
             <h3 className="text-2xl font-bold text-white mb-2">100+ Events</h3>
             <p className="text-gray-400">From arts and cultural programs to technical hackathons.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition duration-300">
             <h3 className="text-2xl font-bold text-white mb-2">Live Scoring</h3>
             <p className="text-gray-400">Real-time leaderboards and instant result publications.</p>
          </div>
      </section>
    </div>
  );
}
