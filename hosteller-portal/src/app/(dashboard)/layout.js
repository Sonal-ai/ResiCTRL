'use client';
import { useEffect } from 'react';
import TopNav from "../../components/TopNav";
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  // Simple authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <TopNav />
      {/* Mobile app-like layout constraint */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-[var(--color-campus-bg)]">
        {children}
      </main>
    </>
  );
}
