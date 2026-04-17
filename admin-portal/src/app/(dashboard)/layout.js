'use client';
import { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { isTokenExpired } from '../../lib/api';

export default function DashboardLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check token existence AND expiry (not just existence)
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired()) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    setIsAuthenticated(true);

    // Periodic token expiry check (every 60 seconds)
    const interval = setInterval(() => {
      if (isTokenExpired()) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render dashboard until auth is confirmed
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-[var(--color-admin-bg)] p-8">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
