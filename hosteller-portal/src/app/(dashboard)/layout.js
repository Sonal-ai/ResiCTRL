'use client';
import { useEffect, useState } from 'react';
import TopNav from "../../components/TopNav";
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '../../lib/api';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check token existence AND expiry
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired()) {
      localStorage.removeItem('token');
      localStorage.removeItem('hostellerId');
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);

    // Periodic token expiry check (every 60 seconds)
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
    <>
      <TopNav />
      <main className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-[var(--color-campus-bg)]">
        {children}
      </main>
    </>
  );
}
