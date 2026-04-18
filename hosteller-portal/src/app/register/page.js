"use client";
import { useState } from 'react';
import { Home, Eye, EyeOff, Loader2, UserPlus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { studentRegister } from '../../lib/api';

const HOSTELS = ['Aryabhatta Hostel', 'CV Raman Hostel', 'Kalpana Hostel', 'Sarojini Hostel', 'Vivekananda Hostel'];

export default function HostellerRegister() {
  const [step, setStep] = useState(1); // 2-step form
  const [form, setForm] = useState({
    name: '', roll_number: '', email: '', password: '', confirmPassword: '',
    dob: '', gender: '', hostel_name: '', room_number: '', phone: '', guardian_contact: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await studentRegister({
        name: form.name,
        roll_number: form.roll_number,
        email: form.email,
        password: form.password,
        dob: form.dob,
        gender: form.gender,
        hostel_name: form.hostel_name,
        room_number: form.room_number,
        phone: form.phone || undefined,
        guardian_contact: form.guardian_contact || undefined,
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
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
        {step === 2 && (
          <button onClick={() => { setStep(1); setError(null); }} className="text-sm text-[var(--color-campus-accent)] hover:underline">
            ← Back
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-6 h-6 text-[var(--color-campus-accent)]" />
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Create Account</h1>
          </div>
          <p className="text-[var(--color-campus-muted)]">
            {step === 1 ? 'Enter your personal details' : 'Hostel information'}
          </p>
          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[var(--color-campus-accent)]' : 'bg-[var(--color-campus-border)]'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[var(--color-campus-accent)]' : 'bg-[var(--color-campus-border)]'}`} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-sm rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Full Name</label>
              <input type="text" value={form.name} onChange={update('name')} className="campus-input bg-white dark:bg-slate-800" placeholder="Aarav Mehta" required minLength={2} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Roll Number</label>
              <input type="text" value={form.roll_number} onChange={update('roll_number')} className="campus-input bg-white dark:bg-slate-800" placeholder="2K22/CO/101" required minLength={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Email Address</label>
              <input type="email" value={form.email} onChange={update('email')} className="campus-input bg-white dark:bg-slate-800" placeholder="student@dtu.ac.in" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Date of Birth</label>
                <input type="date" value={form.dob} onChange={update('dob')} className="campus-input bg-white dark:bg-slate-800" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Gender</label>
                <select value={form.gender} onChange={update('gender')} className="campus-input bg-white dark:bg-slate-800" required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} className="campus-input bg-white dark:bg-slate-800 pr-12" placeholder="Min 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-campus-muted)] hover:text-[var(--color-campus-accent)] transition-colors p-1">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} className="campus-input bg-white dark:bg-slate-800" placeholder="••••••••" required minLength={6} />
            </div>

            <div className="pt-2">
              <button type="submit" className="campus-btn-primary w-full py-4 text-[1.05rem]">
                Next — Hostel Details →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Hostel Info */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Hostel</label>
              <select value={form.hostel_name} onChange={update('hostel_name')} className="campus-input bg-white dark:bg-slate-800" required>
                <option value="">Select your hostel</option>
                {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Room Number</label>
              <input type="text" value={form.room_number} onChange={update('room_number')} className="campus-input bg-white dark:bg-slate-800" placeholder="e.g. 201A" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Phone <span className="font-normal text-[var(--color-campus-muted)]">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={update('phone')} className="campus-input bg-white dark:bg-slate-800" placeholder="9876543210" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-campus-text)] mb-2 pl-1">Guardian Phone <span className="font-normal text-[var(--color-campus-muted)]">(optional)</span></label>
              <input type="tel" value={form.guardian_contact} onChange={update('guardian_contact')} className="campus-input bg-white dark:bg-slate-800" placeholder="9876543211" />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="campus-btn-primary w-full py-4 text-[1.05rem]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--color-campus-muted)]">
            Already registered?{' '}
            <Link href="/login" className="text-[var(--color-campus-accent)] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
