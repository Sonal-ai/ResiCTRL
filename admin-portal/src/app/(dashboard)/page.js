'use client';
import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, UserMinus, Activity, Loader2 } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import { getDashboardMetrics, getRecentScans } from '../../lib/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    studentsInside: 0,
    studentsOutside: 0,
    studentsOnLeave: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, scansRes] = await Promise.all([
          getDashboardMetrics().catch(() => ({ data: { totalStudents: 0, studentsInside: 0, studentsOutside: 0, studentsOnLeave: 0 } })),
          getRecentScans().catch(() => ({ data: [] }))
        ]);
        setMetrics(metricsRes.data || metrics);
        setRecentScans(scansRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-admin-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">Overview Dashboard</h1>
        <p className="text-[var(--color-admin-muted)] text-sm">Real-time metrics and recent activity across the facility.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Students" value={metrics.totalStudents} icon={Users} />
        <MetricCard title="Inside Hostel" value={metrics.studentsInside} icon={UserCheck} />
        <MetricCard title="Outside Hostel" value={metrics.studentsOutside} icon={UserX} type="danger" trend="Requires attention" />
        <MetricCard title="On Approved Leave" value={metrics.studentsOnLeave} icon={UserMinus} />
      </div>

      <div className="admin-card mt-4 overflow-hidden">
        <div className="p-6 border-b border-[var(--color-admin-border)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-admin-text)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-admin-accent)]" />
            Recent Scans
          </h2>
        </div>
        <div className="overflow-x-auto">
          {recentScans.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-admin-muted)]">No recent scans today</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Roll Number</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--color-admin-text)]">{scan.hosteller?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-[var(--color-admin-muted)]">{scan.hosteller?.roll_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        scan.type === 'entry' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' 
                        : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                      }`}>
                        {scan.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-admin-muted)]">
                      {format(new Date(scan.timestamp), 'PPp')}
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
