'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, MapPin, Phone, Shield, Calendar, Activity, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getHostellerById } from '../../../../lib/api';
import { format } from 'date-fns';

const STATUS_BADGE = {
  pending: { color: 'bg-amber-500/10 text-amber-500', icon: Clock },
  approved: { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
  rejected: { color: 'bg-red-500/10 text-red-500', icon: XCircle },
  in_progress: { color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  resolved: { color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle },
  PRESENT: { color: 'bg-emerald-500/10 text-emerald-500' },
  ABSENT: { color: 'bg-red-500/10 text-red-500' },
  ON_LEAVE: { color: 'bg-amber-500/10 text-amber-500' },
};

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await getHostellerById(id);
        setStudent(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-admin-accent)]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-admin-text)] font-medium">Student not found.</p>
        <button onClick={() => router.push('/students')} className="admin-btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </button>
      </div>
    );
  }

  const attendance = student.attendancePercent;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/students')} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-admin-muted)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)]">{student.name}</h1>
          <p className="text-[var(--color-admin-muted)] text-sm">{student.roll_number} • {student.email}</p>
        </div>
      </div>

      {/* Profile Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="admin-card p-6 space-y-4 md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)]/20 to-violet-500/20 flex items-center justify-center text-2xl font-bold text-[var(--color-admin-accent)] mb-3">
              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-admin-text)]">{student.name}</h2>
            <p className="text-sm text-[var(--color-admin-muted)]">{student.roll_number}</p>
            <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              student.current_location === 'INSIDE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${student.current_location === 'INSIDE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {student.current_location === 'INSIDE' ? 'Inside Campus' : 'Outside Campus'}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--color-admin-border)]">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[var(--color-admin-muted)]" />
              <span className="text-[var(--color-admin-text)]">{student.hostel_name} • Room {student.room_number}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-[var(--color-admin-muted)]" />
              <span className="text-[var(--color-admin-text)]">{student.phone || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-[var(--color-admin-muted)]" />
              <span className="text-[var(--color-admin-text)]">Guardian: {student.guardian_name || '—'} ({student.guardian_contact || '—'})</span>
            </div>
          </div>
        </div>

        {/* Stats + Attendance */}
        <div className="md:col-span-2 space-y-4">
          {/* Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="admin-card p-4">
              <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Attendance</p>
              <p className={`text-2xl font-bold mt-1 ${
                attendance >= 75 ? 'text-emerald-500' : attendance >= 50 ? 'text-amber-500' : 'text-red-500'
              }`}>{attendance !== null ? `${attendance}%` : 'N/A'}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-[var(--color-admin-text)] mt-1">{student.total_present_days || 0}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{student.total_absent_count || 0}</p>
            </div>
            <div className="admin-card p-4">
              <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">AWOL</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{student.absent_without_leave_count || 0}</p>
            </div>
          </div>

          {/* Attendance Records (last 30 days) */}
          {student.attendanceRecords?.length > 0 && (
            <div className="admin-card overflow-hidden">
              <div className="p-4 border-b border-[var(--color-admin-border)]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-admin-muted)] flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Attendance History (Last 30 Days)
                </h3>
              </div>
              <div className="p-4 flex flex-wrap gap-1.5">
                {student.attendanceRecords.map(r => (
                  <div key={r.id} title={`${format(new Date(r.date), 'MMM d')} — ${r.status}`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      r.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' :
                      r.status === 'ABSENT' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                    {format(new Date(r.date), 'd')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan Activity + Leaves + Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scan Events */}
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-[var(--color-admin-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-admin-muted)] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Recent Scans
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-admin-border)]">
            {student.scanEvents?.length > 0 ? student.scanEvents.slice(0, 10).map(e => (
              <div key={e.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    e.type === 'entry' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>{e.type === 'entry' ? 'Entry' : 'Exit'}</span>
                </div>
                <span className="text-xs text-[var(--color-admin-muted)]">{format(new Date(e.timestamp), 'MMM d, h:mm a')}</span>
              </div>
            )) : (
              <p className="p-4 text-sm text-[var(--color-admin-muted)]">No scan history</p>
            )}
          </div>
        </div>

        {/* Leaves */}
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-[var(--color-admin-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-admin-muted)] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Leave History
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-admin-border)]">
            {student.leaves?.length > 0 ? student.leaves.map(l => {
              const badge = STATUS_BADGE[l.status] || STATUS_BADGE.pending;
              return (
                <div key={l.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>{l.status}</span>
                    <span className="text-xs text-[var(--color-admin-muted)]">{format(new Date(l.start_date), 'MMM d')} - {format(new Date(l.end_date), 'MMM d')}</span>
                  </div>
                  <p className="text-xs text-[var(--color-admin-text)] truncate">{l.reason}</p>
                </div>
              );
            }) : (
              <p className="p-4 text-sm text-[var(--color-admin-muted)]">No leave history</p>
            )}
          </div>
        </div>

        {/* Complaints */}
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-[var(--color-admin-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-admin-muted)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Complaints
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-admin-border)]">
            {student.complaints?.length > 0 ? student.complaints.map(c => {
              const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
              return (
                <div key={c.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color}`}>{c.status}</span>
                    <span className="text-xs text-[var(--color-admin-muted)]">{c.category}</span>
                  </div>
                  <p className="text-xs text-[var(--color-admin-text)] truncate">{c.title}</p>
                </div>
              );
            }) : (
              <p className="p-4 text-sm text-[var(--color-admin-muted)]">No complaints</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
