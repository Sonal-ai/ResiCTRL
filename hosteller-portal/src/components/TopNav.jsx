'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CalendarPlus, UserRound, LogOut, MessageSquareWarning, Settings, Vote, Megaphone } from 'lucide-react';
import clsx from 'clsx';
import { studentLogout } from '../lib/api';
import { ThemeToggle } from './ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leave', href: '/leave', icon: CalendarPlus },
    { name: 'Complaints', href: '/complaints', icon: MessageSquareWarning },
    { name: 'Elections', href: '/elections', icon: Vote },
    { name: 'Notices', href: '/announcements', icon: Megaphone },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = () => {
    studentLogout();
    router.push('/login');
  };

  return (
    <>
      {/* ═══ DESKTOP / TABLET SIDEBAR (md+) ═══ */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 lg:w-72 flex-col bg-[var(--color-campus-card)] border-r border-[var(--color-campus-border)] z-50">
        {/* Logo */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-[var(--color-campus-border)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-campus-accent)] to-[var(--color-campus-secondary)] flex items-center justify-center shadow-md">
            <UserRound className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--color-campus-text)]">ResiCTRL</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[var(--color-campus-accent)]/10 text-[var(--color-campus-accent)]'
                    : 'text-[var(--color-campus-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-campus-text)]'
                )}
              >
                <Icon className={clsx(
                  'w-5 h-5 transition-colors shrink-0',
                  isActive && 'text-[var(--color-campus-accent)]'
                )} />
                <span>{link.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-[var(--color-campus-border)] space-y-2">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-[var(--color-campus-muted)] font-medium uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-red-500 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══ MOBILE TOP BAR (< md) ═══ */}
      <header className="md:hidden bg-[var(--color-campus-card)] border-b border-[var(--color-campus-border)] sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-campus-accent)] to-[var(--color-campus-secondary)] flex items-center justify-center shadow-md">
              <UserRound className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--color-campus-text)]">ResiCTRL</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-[var(--color-campus-muted)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE BOTTOM TAB BAR (< md) ═══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-campus-card)]/95 backdrop-blur-lg border-t border-[var(--color-campus-border)] z-50 safe-area-pb">
        <div className="flex items-center justify-around px-2 h-16">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all min-w-[3.5rem]',
                  isActive
                    ? 'text-[var(--color-campus-accent)]'
                    : 'text-[var(--color-campus-muted)]'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive && 'fill-[var(--color-campus-accent)]/20')} />
                <span className="text-[10px] font-medium leading-none">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
