'use client';
import { useState, useEffect } from 'react';
import { Calendar, Send, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { applyLeave, getMyLeaves } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { format } from 'date-fns';

const STATUS_STYLES = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Pending' },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Rejected' },
};

export default function ApplyLeavePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hostellerId, setHostellerId] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [leavesLoading, setLeavesLoading] = useState(true);

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    const storedId = localStorage.getItem('hostellerId');
    if (storedId) setHostellerId(storedId);
    fetchLeaves();
  }, []);

  // Fetch leave history
  const fetchLeaves = async () => {
    try {
      const res = await getMyLeaves();
      setLeaves(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hostellerId) {
      alert('No hosteller ID found. Please log in again.');
      return;
    }
    setIsSubmitting(true);
    try {
      await applyLeave({
        hostellerId: hostellerId,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        reason: formData.reason
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      setFormData({ start_date: '', end_date: '', reason: '' });
      fetchLeaves(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to apply for leave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="mb-2 mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Leave</h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Submit a request and track your leave history.</p>
      </div>

      {success && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-center py-8">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Send className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-1">Request Sent!</h2>
          <p className="text-sm text-emerald-700 dark:text-emerald-500/80">Your leave application is pending approval.</p>
        </div>
      )}

      {/* Apply Leave Form */}
      <form onSubmit={handleSubmit} className="campus-card space-y-6">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> New Request
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> Leave Dates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-[var(--color-campus-muted)] block mb-1 ml-1">From</span>
              <input 
                required
                type="date" 
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
                className="campus-input text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-[var(--color-campus-muted)] block mb-1 ml-1">To</span>
              <input 
                required
                type="date" 
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
                className="campus-input text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> Reason
          </label>
          <textarea 
            required
            rows="3" 
            placeholder="Please explain why you need leave..."
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
            className="campus-input resize-none"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="campus-btn-primary w-full mt-2">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Application <Send className="w-4 h-4 ml-2" /></>}
        </button>
      </form>

      {/* ── Leave History (NEW — Phase 4.3) ── */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-campus-accent)]" /> Your Leave History
        </h2>

        {leavesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-campus-accent)]" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="campus-card text-center py-8">
            <Calendar className="w-10 h-10 text-[var(--color-campus-muted)]/40 mx-auto mb-2" />
            <p className="text-[var(--color-campus-muted)] text-sm">No leave requests yet</p>
          </div>
        ) : (
          leaves.map(leave => {
            const statusStyle = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const StatusIcon = statusStyle.icon;
            return (
              <div key={leave.id} className="campus-card space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-campus-text)]">
                      {format(new Date(leave.start_date), 'MMM d, yyyy')} — {format(new Date(leave.end_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-[var(--color-campus-muted)] mt-0.5 truncate">{leave.reason}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
