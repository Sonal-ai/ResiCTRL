"use client";
import { useState } from 'react';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { studentLogin } from '../../lib/api';

export default function HostellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await studentLogin({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-campus-bg)] flex flex-col px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-80 bg-gradient-to-b from-[var(--color-campus-accent)]/10 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="w-full py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 text-[var(--color-campus-text)] hover:text-[var(--color-campus-accent)] transition-colors">
          <div className="p-2 bg-[var(--color-campus-border)] dark:bg-[var(--color-campus-card)] rounded-lg">
            <Home className="w-4 h-4" />
          </div>
        </Link>
      </nav>

      {/* Main Login Card */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-campus-text)]">Welcome back,</h1>
          <p className="text-[var(--color-campus-muted)] mt-2">Sign in to access your student portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Email <span className="font-normal text-[var(--color-campus-muted)]">(or Roll No)</span></label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="campus-input bg-white dark:bg-slate-800"
              placeholder="e.g. EC-2023-010 or email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="campus-input bg-white dark:bg-slate-800 pr-12"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-campus-muted)] hover:text-[var(--color-campus-accent)] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="campus-btn-primary w-full py-4 text-[1.05rem]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}
