'use client';
import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, UserMinus, AlertTriangle, CalendarClock, MessageSquareWarning, Activity, Loader2, ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { getDashboardSummary, getRecentScans } from '../../lib/api';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    // Get admin name from JWT
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminName(payload.name || 'Admin');
      }
    } catch (e) { /* ignore */ }

    const fetchData = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--color-admin-accent)] animate-spin" />
          <p className="text-sm text-[var(--color-admin-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Build alert items
  const alerts = [];
  if (data?.outsideWithoutLeave > 0) {
    alerts.push({
      type: 'danger',
      icon: ShieldAlert,
      title: `${data.outsideWithoutLeave} student${data.outsideWithoutLeave > 1 ? 's' : ''} outside without leave`,
      subtitle: data.outsideWithoutLeaveList?.map(s => s.name).join(', '),
      link: '/students',
      linkText: 'View Students'
    });
  }
  if (data?.pendingLeaves > 0) {
    alerts.push({
      type: 'warning',
      icon: CalendarClock,
      title: `${data.pendingLeaves} leave request${data.pendingLeaves > 1 ? 's' : ''} awaiting approval`,
      link: '/leaves',
      linkText: 'Review Leaves'
    });
  }
  if (data?.pendingComplaints > 0) {
    alerts.push({
      type: 'info',
      icon: MessageSquareWarning,
      title: `${data.pendingComplaints} unresolved complaint${data.pendingComplaints > 1 ? 's' : ''}`,
      link: '/complaints',
      linkText: 'View Complaints'
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">
            {greeting}, {adminName.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--color-admin-muted)] text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's what's happening in your hostels today.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] text-xs text-[var(--color-admin-muted)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          System Online
        </div>
      </div>

      {/* Metric Cards - 2 rows of 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Hostellers" 
          value={data?.totalStudents || 0} 
          icon={Users} 
          type="default"
        />
        <MetricCard 
          title="Inside Hostel" 
          value={data?.studentsInside || 0} 
          icon={UserCheck} 
          type="success" 
          subtitle="Currently in campus"
        />
        <MetricCard 
          title="Outside Without Leave" 
          value={data?.outsideWithoutLeave || 0} 
          icon={AlertTriangle} 
          type="danger" 
          trend={data?.outsideWithoutLeave > 0 ? 'Needs attention' : 'Good'}
        />
        <MetricCard 
          title="On Approved Leave" 
          value={data?.studentsOnLeave || 0} 
          icon={UserMinus} 
          type="warning"
          subtitle="Active approved leaves"
        />
        <MetricCard 
          title="Pending Leaves" 
          value={data?.pendingLeaves || 0} 
          icon={CalendarClock} 
          type="purple"
          subtitle="Awaiting your action"
        />
        <MetricCard 
          title="Pending Complaints" 
          value={data?.pendingComplaints || 0} 
          icon={MessageSquareWarning} 
          type="orange"
          subtitle="Unresolved issues"
        />
      </div>

      {/* Quick Action Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`admin-card p-4 flex items-center gap-4 border-l-4 ${
              alert.type === 'danger' ? 'border-l-red-500' : alert.type === 'warning' ? 'border-l-amber-500' : 'border-l-[var(--color-admin-accent)]'
            }`}>
              <div className={`p-2 rounded-lg shrink-0 ${
                alert.type === 'danger' ? 'bg-red-500/10' : alert.type === 'warning' ? 'bg-amber-500/10' : 'bg-[var(--color-admin-accent)]/10'
              }`}>
                <alert.icon className={`w-5 h-5 ${
                  alert.type === 'danger' ? 'text-red-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-[var(--color-admin-accent)]'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-admin-text)]">{alert.title}</p>
                {alert.subtitle && (
                  <p className="text-xs text-[var(--color-admin-muted)] truncate mt-0.5">{alert.subtitle}</p>
                )}
              </div>
              <Link 
                href={alert.link} 
                className="shrink-0 flex items-center gap-1 text-xs font-medium text-[var(--color-admin-accent)] hover:underline"
              >
                {alert.linkText} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Recent Scans Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-5 border-b border-[var(--color-admin-border)] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-admin-text)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-admin-accent)]" />
            Recent Activity
          </h2>
          <span className="text-xs text-[var(--color-admin-muted)]">Last 10 scans</span>
        </div>
        <div className="overflow-x-auto">
          {(!data?.recentScans || data.recentScans.length === 0) ? (
            <div className="p-10 text-center">
              <Activity className="w-10 h-10 text-[var(--color-admin-muted)]/30 mx-auto mb-2" />
              <p className="text-[var(--color-admin-muted)] text-sm">No recent scans</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Camera</th>
                  <th className="px-5 py-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)]">
                {data.recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-sm">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)]/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-[var(--color-admin-accent)] shrink-0">
                          {scan.hosteller?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-admin-text)]">{scan.hosteller?.name || 'Unknown'}</p>
                          <p className="text-xs text-[var(--color-admin-muted)]">{scan.hosteller?.roll_number || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        scan.type === 'entry'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${scan.type === 'entry' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {scan.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--color-admin-muted)] text-xs">
                      {scan.camera_id}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[var(--color-admin-muted)]">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDistanceToNow(new Date(scan.timestamp), { addSuffix: true })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
