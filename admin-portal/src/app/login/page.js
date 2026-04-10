"use client";
import { useState } from 'react';
import { ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
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
      await adminLogin({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-[var(--color-admin-accent)]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="admin-card w-full max-w-md p-8 relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-admin-accent)]/10 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-[var(--color-admin-accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">Admin Secure Login</h1>
          <p className="text-sm text-[var(--color-admin-muted)] mt-1">Authenticate to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="admin@hostel.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input pr-10"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="admin-btn-primary w-full mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[var(--color-admin-muted)] hover:text-[var(--color-admin-accent)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
