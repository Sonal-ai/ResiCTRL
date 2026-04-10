'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarSync, LogOut, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Leave Requests', href: '/leaves', icon: CalendarSync },
  ];

  return (
    <aside className="w-64 h-screen border-r border-[var(--color-admin-border)] bg-[var(--color-admin-card)] flex flex-col pt-8 pb-4 transition-all">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-admin-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-admin-accent)]/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-wide text-white">ResiCTRL</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)]'
                  : 'text-[var(--color-admin-muted)] hover:bg-[#20242c] hover:text-white'
              )}
            >
              <Icon className={clsx("w-5 h-5", isActive ? "text-[var(--color-admin-accent)]" : "text-[var(--color-admin-muted)] group-hover:text-white")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-admin-muted)] hover:bg-[#20242c] hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
