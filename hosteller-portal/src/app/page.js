"use client";
import Link from 'next/link';
import { Home, Compass, MapPin, ChevronRight, Shield, Bell, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function HostellerLanding() {
  return (
    <div className="min-h-[100dvh] bg-[var(--color-campus-bg)] flex flex-col relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-campus-accent)]/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-campus-secondary)]/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      {/* Nav */}
      <nav className="w-full px-6 md:px-12 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--color-campus-accent)] rounded-lg">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--color-campus-text)]">ResiCTRL</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-flex campus-btn text-sm text-[var(--color-campus-accent)] border border-[var(--color-campus-accent)]/20 hover:bg-[var(--color-campus-accent)]/5 !py-2 !px-4">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 z-10 w-full max-w-4xl mx-auto">
        <div className="inline-flex flex-col items-center justify-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-[var(--color-campus-accent)]/10 flex items-center justify-center transform rotate-3">
              <Compass className="w-12 h-12 md:w-14 md:h-14 text-[var(--color-campus-accent)]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center transform -rotate-6">
              <MapPin className="w-5 h-5 text-[var(--color-campus-secondary)]" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--color-campus-text)] mb-4">
          Your Campus Life, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-campus-accent)] to-[var(--color-campus-secondary)]">Simplified.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-campus-muted)] mb-10 max-w-xl">
          Manage your leaves, view your attendance, and track your hostel entry and exit all in one place.
        </p>

        <Link href="/login" className="campus-btn-primary text-lg flex items-center justify-center gap-2 py-4 px-10 shadow-xl w-full sm:w-auto">
          Enter Portal 
          <ChevronRight className="w-5 h-5" />
        </Link>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {[
            { icon: Shield, label: 'Secure Login' },
            { icon: BarChart3, label: 'Live Attendance' },
            { icon: Bell, label: 'Instant Alerts' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-campus-card)] border border-[var(--color-campus-border)] rounded-full text-sm text-[var(--color-campus-muted)]">
              <Icon className="w-4 h-4 text-[var(--color-campus-accent)]" />
              {label}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
