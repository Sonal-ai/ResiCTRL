"use client";
import { useState } from 'react';
import { ShieldCheck, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { adminRegister } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminRegister() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', designation: 'WARDEN', admin_key: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await adminRegister({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        designation: form.designation,
        admin_key: form.admin_key,
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute top-[15%] right-[15%] w-[30%] h-[30%] bg-[var(--color-admin-accent)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[20%] h-[20%] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="admin-card w-full max-w-md p-8 relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10">
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-admin-accent)]/10 flex items-center justify-center mb-4">
            <UserPlus className="w-7 h-7 text-[var(--color-admin-accent)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">Admin Registration</h1>
          <p className="text-sm text-[var(--color-admin-muted)] mt-1">Create a new admin account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={update('name')} className="admin-input" placeholder="Dr. Rajesh Sharma" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={update('email')} className="admin-input" placeholder="admin@hostel.com" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} className="admin-input pr-10" placeholder="••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} className="admin-input" placeholder="••••••" required minLength={6} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Phone <span className="font-normal text-[var(--color-admin-muted)]">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={update('phone')} className="admin-input" placeholder="9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">Designation</label>
              <select value={form.designation} onChange={update('designation')} className="admin-input">
                <option value="WARDEN">Warden</option>
                <option value="RESI_WARDEN">Resident Warden</option>
                <option value="ATTENDANT">Attendant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-admin-text)] mb-1.5">
              Admin Registration Key
              <span className="ml-1 text-[var(--color-danger)]">*</span>
            </label>
            <input type="password" value={form.admin_key} onChange={update('admin_key')} className="admin-input" placeholder="Enter the secret admin key" required />
            <p className="text-xs text-[var(--color-admin-muted)] mt-1">Contact your system administrator for this key</p>
          </div>

          <button type="submit" disabled={loading} className="admin-btn-primary w-full mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-[var(--color-admin-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-admin-accent)] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
