"use client";
import Link from 'next/link';
import { Home, Compass, MapPin, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function HostellerLanding() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-campus-bg)] flex flex-col relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-campus-accent)]/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-campus-secondary)]/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      {/* Nav */}
      <nav className="w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--color-campus-accent)] rounded-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--color-campus-text)]">ResiCTRL</span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 w-full max-w-lg mx-auto">
        <div className="inline-flex flex-col items-center justify-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-[var(--color-campus-accent)]/10 flex items-center justify-center transform rotate-3">
              <Compass className="w-12 h-12 text-[var(--color-campus-accent)]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center transform -rotate-6">
              <MapPin className="w-5 h-5 text-[var(--color-campus-secondary)]" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-campus-text)] mb-4">
          Your Campus Life, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-campus-accent)] to-[var(--color-campus-secondary)]">Simplified.</span>
        </h1>
        
        <p className="text-lg text-[var(--color-campus-muted)] mb-10">
          Manage your leaves, view your attendance, and track your hostel entry and exit all in one place.
        </p>

        <Link href="/login" className="campus-btn-primary w-full text-lg flex items-center justify-center gap-2 py-4 shadow-xl">
          Enter Portal 
          <ChevronRight className="w-5 h-5" />
        </Link>
      </main>

    </div>
  );
}
