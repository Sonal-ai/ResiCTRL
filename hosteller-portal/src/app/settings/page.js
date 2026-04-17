'use client';
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, User, Mail, MapPin } from 'lucide-react';
import { changePassword, getMyProfile } from '../../lib/api';

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-20 flex flex-col gap-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Settings</h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Manage your profile and security.</p>
      </div>

      {/* Profile Info Card */}
      {!loading && profile && (
        <div className="campus-card space-y-4">
          <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> Profile
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-[var(--color-campus-muted)]" />
              <div>
                <p className="text-[var(--color-campus-text)] font-medium">{profile.name}</p>
                <p className="text-xs text-[var(--color-campus-muted)]">{profile.roll_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[var(--color-campus-muted)]" />
              <span className="text-[var(--color-campus-text)]">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[var(--color-campus-muted)]" />
              <span className="text-[var(--color-campus-text)]">{profile.hostel_name} • Room {profile.room_number}</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-400">Password Changed!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500/80">Your password has been updated successfully.</p>
          </div>
        </div>
      )}

      {/* Change Password Form */}
      <form onSubmit={handleSubmit} className="campus-card space-y-5">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--color-campus-accent)]" /> Change Password
        </h2>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Current Password</label>
          <div className="relative">
            <input
              required
              type={showOld ? 'text' : 'password'}
              value={formData.oldPassword}
              onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
              className="campus-input text-sm pr-12"
              placeholder="Enter current password"
            />
            <button type="button" onClick={() => setShowOld(!showOld)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-campus-muted)] p-1">
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">New Password</label>
          <div className="relative">
            <input
              required
              type={showNew ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              className="campus-input text-sm pr-12"
              placeholder="At least 6 characters"
              minLength={6}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-campus-muted)] p-1">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Confirm New Password</label>
          <input
            required
            type="password"
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="campus-input text-sm"
            placeholder="Re-enter new password"
            minLength={6}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="campus-btn-primary w-full mt-2">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
