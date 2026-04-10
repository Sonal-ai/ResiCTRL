import { Geist, Geist_Mono } from "next/font/google";
import TopNav from "../components/TopNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ResiCTRL | Campus",
  description: "Student portal for hostel operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-campus-bg)]">
        <TopNav />
        {/* Mobile app-like layout constraint */}
        <main className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-[var(--color-campus-bg)]">
          {children}
        </main>
      </body>
    </html>
  );
}
