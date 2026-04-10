'use client';
import { useEffect } from 'react';
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout({ children }) {
  // Simple check if token exists, else redirect to login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <>
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto bg-[var(--color-admin-bg)] p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}
