'use client';
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "../components/Sidebar";
import "./globals.css";
import { useEffect } from 'react';
import { loginAdmin } from '../lib/api';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  useEffect(() => {
    loginAdmin();
  }, []);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto bg-[var(--color-admin-bg)] p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
