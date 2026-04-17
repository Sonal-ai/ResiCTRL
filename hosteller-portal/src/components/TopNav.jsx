'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CalendarPlus, UserRound, LogOut, MessageSquareWarning, Settings } from 'lucide-react';
import clsx from 'clsx';
import { studentLogout } from '../lib/api';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Apply Leave', href: '/leave', icon: CalendarPlus },
    { name: 'Complaints', href: '/complaints', icon: MessageSquareWarning },
    { name: 'Settings', href: '/settings', icon: Settings },  // NEW — Phase 4.2
  ];

  const handleSignOut = () => {
    studentLogout();
    router.push('/login');
  };

  return (
    <nav className="bg-[var(--color-campus-card)] border-b border-[var(--color-campus-border)] sticky top-0 z-50">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-campus-accent)] to-[var(--color-campus-secondary)] flex items-center justify-center shadow-md">
            <UserRound className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[var(--color-campus-text)]">ResiCTRL</span>
        </div>
        
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'flex flex-col items-center gap-1 transition-all p-2 rounded-xl',
                  isActive ? 'text-[var(--color-campus-accent)] bg-[var(--color-campus-accent)]/5' : 'text-[var(--color-campus-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                )}
                title={link.name}
              >
                <Icon className={clsx("w-5 h-5", isActive && "fill-[var(--color-campus-accent)]/20")} />
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 transition-all p-2 rounded-xl text-[var(--color-campus-muted)] hover:bg-black/5 dark:hover:bg-white/5"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
