'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, MapPin, Activity, Check, BarChart3, Calendar, Loader2, CalendarPlus, MessageSquareWarning, Vote, Megaphone, ChevronRight } from 'lucide-react';
import { simulateScan, getMyProfile, getMyLeaves, getMyComplaints, getAnnouncements } from '../../lib/api';
import { format } from 'date-fns';
import AuthGuard from '../../components/AuthGuard';

export default function MobileDashboard() {
  const [hostellerId, setHostellerId] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [leaveCount, setLeaveCount] = useState(null);
  const [complaintCount, setComplaintCount] = useState(null);
  const [announcementCount, setAnnouncementCount] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('hostellerId');
    if (storedId) setHostellerId(storedId);

    // Fetch real profile data
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data?.data || res.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();

    // Fetch summary counts for quick links
    const fetchCounts = async () => {
      try {
        const [leavesRes, complaintsRes, announcementsRes] = await Promise.allSettled([
          getMyLeaves(),
          getMyComplaints(),
          getAnnouncements(),
        ]);
        if (leavesRes.status === 'fulfilled') {
          const data = leavesRes.value.data?.data || leavesRes.value.data || [];
          setLeaveCount(Array.isArray(data) ? data.filter(l => l.status === 'pending').length : 0);
        }
        if (complaintsRes.status === 'fulfilled') {
          const data = complaintsRes.value.data?.data || complaintsRes.value.data || [];
          setComplaintCount(Array.isArray(data) ? data.length : 0);
        }
        if (announcementsRes.status === 'fulfilled') {
          const data = announcementsRes.value.data?.data || announcementsRes.value.data || [];
          setAnnouncementCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error('Count fetch error:', err);
      }
    };
    fetchCounts();
  }, []);

  const handleScan = async (type) => {
    if (!hostellerId) {
      alert('No hosteller ID found. Please log in again.');
      return;
    }
    setIsSimulating(true);
    try {
      const res = await simulateScan({ 
        hosteller_id: hostellerId, 
        type,
        timestamp: new Date().toISOString(),
        camera_id: 'SIM-MOBILE-01'
      });
      setLastScan(res.data.scanEvent);
      // Update profile location after scan
      setProfile(prev => prev ? { ...prev, current_location: type === 'entry' ? 'INSIDE' : 'OUTSIDE' } : prev);
      setTimeout(() => setIsSimulating(false), 800);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
      alert("Scan failed");
    }
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const attendancePercent = profile?.attendancePercent ?? 
    (profile?.total_working_days > 0 
      ? Math.round((profile.total_present_days / profile.total_working_days) * 100) 
      : null);

  const quickLinks = [
    { name: 'Apply Leave', href: '/leave', icon: CalendarPlus, color: 'from-blue-500 to-cyan-500', badge: leaveCount },
    { name: 'Complaints', href: '/complaints', icon: MessageSquareWarning, color: 'from-orange-500 to-amber-500', badge: complaintCount },
    { name: 'Elections', href: '/elections', icon: Vote, color: 'from-violet-500 to-fuchsia-500', badge: null },
    { name: 'Notices', href: '/announcements', icon: Megaphone, color: 'from-emerald-500 to-teal-500', badge: announcementCount },
  ];

  return (
    <AuthGuard>
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      {/* Greeting — uses real name */}
      <div className="mt-4">
        <p className="text-[var(--color-campus-muted)] flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4" /> Campus View
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-campus-text)]">
          {getGreeting()}, {profileLoading ? '...' : (profile?.name?.split(' ')[0] || 'Hosteller')}
        </h1>
      </div>

      {/* Status Card — uses REAL current_location */}
      <div className={`campus-card bg-gradient-to-br ${
        profile?.current_location === 'INSIDE' 
          ? 'from-indigo-500 to-purple-600' 
          : 'from-orange-500 to-red-500'
      } border-none text-white overflow-hidden relative shadow-lg shadow-indigo-500/20`}>
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Activity className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1">Current Status</p>
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                profile?.current_location === 'INSIDE' ? 'bg-green-400' : 'bg-yellow-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                profile?.current_location === 'INSIDE' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {profileLoading ? 'Loading...' : (profile?.current_location === 'INSIDE' ? 'Inside Campus' : 'Outside Campus')}
            </span>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 mb-2">Simulate ID Card Scan</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleScan('entry')}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isSimulating}
              >
                Entry
              </button>
              <button 
                onClick={() => handleScan('exit')}
                className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isSimulating}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Animation */}
      {isSimulating && (
        <div className="campus-card flex flex-col items-center justify-center py-10 animate-pulse">
          <Camera className="w-10 h-10 text-[var(--color-campus-accent)] animate-bounce mb-4" />
          <p className="font-medium text-[var(--color-campus-text)]">Scanning ID...</p>
        </div>
      )}

      {/* Scan Success */}
      {!isSimulating && lastScan && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 flex items-start gap-4">
          <div className="p-2 bg-emerald-500 rounded-full text-white mt-1">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-400">Scan Successful</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mt-1">
              Recorded {lastScan.type} scan at {new Date(lastScan.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards (real data) */}
      {!profileLoading && profile && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="campus-card flex flex-col items-center justify-center py-5">
            <BarChart3 className="w-5 h-5 text-[var(--color-campus-accent)] mb-2" />
            <p className={`text-2xl font-bold ${
              attendancePercent >= 75 ? 'text-emerald-500' : attendancePercent >= 50 ? 'text-amber-500' : 'text-red-500'
            }`}>
              {attendancePercent !== null ? `${attendancePercent}%` : 'N/A'}
            </p>
            <p className="text-xs text-[var(--color-campus-muted)] mt-1">Attendance</p>
          </div>
          <div className="campus-card flex flex-col items-center justify-center py-5">
            <Calendar className="w-5 h-5 text-[var(--color-campus-accent)] mb-2" />
            <p className="text-2xl font-bold text-[var(--color-campus-text)]">{profile.total_present_days || 0}</p>
            <p className="text-xs text-[var(--color-campus-muted)] mt-1">Days Present</p>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--color-campus-text)] text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className="campus-card group hover:shadow-md transition-all flex items-center gap-3 !p-4 relative"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-campus-text)] truncate">{link.name}</p>
                  {link.badge !== null && link.badge !== undefined && (
                    <p className="text-xs text-[var(--color-campus-muted)]">{link.badge} active</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-campus-muted)] group-hover:text-[var(--color-campus-accent)] transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Scans (real data) */}
      {profile?.scanEvents?.length > 0 && (
        <div className="campus-card overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-campus-border)]">
            <h3 className="font-semibold text-[var(--color-campus-text)] text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-campus-accent)]" /> Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-campus-border)]">
            {profile.scanEvents.slice(0, 5).map(e => (
              <div key={e.id} className="px-5 py-3 flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  e.type === 'entry' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>{e.type === 'entry' ? '↓ Entry' : '↑ Exit'}</span>
                <span className="text-xs text-[var(--color-campus-muted)]">{format(new Date(e.timestamp), 'MMM d, h:mm a')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
