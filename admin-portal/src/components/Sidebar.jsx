'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarSync, LogOut, ShieldAlert, MessageSquareWarning, Moon, Sun, CalendarCheck } from 'lucide-react';
import clsx from 'clsx';
import { adminLogout } from '../lib/api';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('');

  useEffect(() => {
    setMounted(true);
    // Decode JWT to get admin name
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminName(payload.name || 'Admin');
        setAdminRole(payload.designation || payload.role || 'WARDEN');
      }
    } catch (e) { /* ignore */ }
  }, []);

  const links = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Leave Requests', href: '/leaves', icon: CalendarSync },
    { name: 'Complaints', href: '/complaints', icon: MessageSquareWarning },
  ];

  const handleSignOut = () => {
    adminLogout();
    router.push('/login');
  };

  return (
    <aside className="w-64 h-screen border-r border-[var(--color-admin-border)] bg-[var(--color-admin-card)] flex flex-col shrink-0 transition-all">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-[var(--color-admin-border)]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-admin-accent)] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[var(--color-admin-accent)]/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-wide text-[var(--color-admin-text)]">ResiCTRL</span>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-admin-muted)] font-medium -mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] uppercase tracking-widest text-[var(--color-admin-muted)] font-semibold mb-3">Menu</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)]'
                  : 'text-[var(--color-admin-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-admin-text)]'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--color-admin-accent)] rounded-r-full" />
              )}
              <Icon className={clsx("w-[18px] h-[18px]", isActive ? "text-[var(--color-admin-accent)]" : "text-[var(--color-admin-muted)] group-hover:text-[var(--color-admin-text)]")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer section */}
      <div className="border-t border-[var(--color-admin-border)] p-3 space-y-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-admin-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-admin-text)] transition-all"
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        {/* Sign out */}
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-admin-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>

        {/* Admin profile */}
        {adminName && (
          <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-lg bg-black/5 dark:bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)] to-[#8b5cf6] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {adminName.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-admin-text)] truncate">{adminName}</p>
              <p className="text-[10px] text-[var(--color-admin-muted)] uppercase tracking-wider">{adminRole}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
