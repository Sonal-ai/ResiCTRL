"use client";
import Link from 'next/link';
import { ShieldCheck, Activity, Users, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export default function AdminLanding() {
  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-admin-accent)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Nav */}
      <nav className="absolute top-0 w-full px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-[var(--color-admin-accent)]" />
          <span className="text-xl font-bold tracking-tight text-[var(--color-admin-text)]">ResiCTRL <span className="font-light">Admin</span></span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero Content */}
      <main className="z-10 flex flex-col items-center text-center px-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-admin-accent)]/30 bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-admin-accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-admin-accent)]"></span>
          </span>
          System Online
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[var(--color-admin-text)] mb-6 drop-shadow-sm">
          Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-admin-accent)] to-[#8b5cf6]">Hostel Management</span>
        </h1>
        
        <p className="text-lg text-[var(--color-admin-muted)] mb-10 max-w-2xl">
          Complete oversight of facility operations. Monitor real-time student activity, automate leave approvals, and maintain campus security with precision.
        </p>

        <div className="flex gap-4">
          <Link href="/login" className="admin-btn-primary flex items-center gap-2 group text-base px-6 py-3">
            Admin Login
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-24 border-t border-[var(--color-admin-border)] pt-12 w-full">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-admin-border)]">
              <Activity className="w-6 h-6 text-[var(--color-admin-accent)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-admin-text)]">Real-time Analytics</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-admin-border)]">
              <Users className="w-6 h-6 text-[#10b981]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-admin-text)]">Live Occupancy</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-admin-border)]">
              <ShieldCheck className="w-6 h-6 text-[#8b5cf6]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-admin-text)]">Secure Access</p>
          </div>
        </div>
      </main>

    </div>
  );
}
