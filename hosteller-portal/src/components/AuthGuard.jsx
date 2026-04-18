'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '../lib/api';
import TopNav from './TopNav';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired()) {
      localStorage.removeItem('token');
      localStorage.removeItem('hostellerId');
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);

    const interval = setInterval(() => {
      if (isTokenExpired()) {
        localStorage.removeItem('token');
        localStorage.removeItem('hostellerId');
        router.push('/login');
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--color-campus-bg)]">
      <TopNav />
      {/* Main content area — offset for sidebar on md+, bottom padding for mobile tab bar */}
      <main className="md:ml-64 lg:ml-72 min-h-screen pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
