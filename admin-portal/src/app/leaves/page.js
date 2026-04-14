'use client';
import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getLeaves, updateLeaveStatus } from '../../lib/api';
import { format } from 'date-fns';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await getLeaves();
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">Leave Requests</h1>
        <p className="text-[var(--color-admin-muted)] text-sm">Review and manage student leave applications.</p>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-admin-border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-admin-muted)]">Pending Actions</h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CalendarDays className="w-12 h-12 text-[var(--color-admin-muted)]/50 mb-3" />
            <p className="text-[var(--color-admin-text)] font-medium">No leave requests found</p>
            <p className="text-[var(--color-admin-muted)] text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Student Info</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-admin-text)] font-medium">{leave.hosteller?.name || 'Unknown'}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5">{leave.hosteller?.roll_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-admin-text)] text-sm">
                        {format(new Date(leave.start_date), 'MMM d, yyyy')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-[var(--color-admin-text)] truncate">{leave.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        leave.status === 'approved' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' 
                        : leave.status === 'rejected' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                        : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                      }`}>
                        {leave.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'approved')}
                            className="p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success)]/10 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'rejected')}
                            className="p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[var(--color-admin-muted)] text-xs italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
