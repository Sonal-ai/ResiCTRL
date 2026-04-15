'use client';
import { useEffect, useState } from 'react';
import { MessageSquareWarning, CheckCircle, XCircle, Clock, Loader2, X, Search, Filter, Image as ImageIcon } from 'lucide-react';
import { getComplaints, updateComplaintStatus } from '../../../lib/api';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  in_progress: 'bg-blue-500/10 text-blue-500',
  resolved: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  rejected: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
};

const CATEGORY_COLORS = {
  general: 'bg-slate-500/10 text-slate-400',
  maintenance: 'bg-orange-500/10 text-orange-400',
  hygiene: 'bg-emerald-500/10 text-emerald-400',
  noise: 'bg-purple-500/10 text-purple-400',
  food: 'bg-amber-500/10 text-amber-400',
  other: 'bg-pink-500/10 text-pink-400',
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getComplaints(params);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      await updateComplaintStatus(id, { status, admin_response: responseText });
      setSelectedComplaint(null);
      setResponseText('');
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert('Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = complaints.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.hosteller?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.hosteller?.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">Complaints</h1>
        <p className="text-[var(--color-admin-muted)] text-sm">Review and resolve hosteller complaints.</p>
      </div>

      <div className="admin-card overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-[var(--color-admin-border)] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-admin-muted)]" />
            <input
              type="text"
              placeholder="Search by title, name, or roll no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="admin-input w-auto min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <MessageSquareWarning className="w-12 h-12 text-[var(--color-admin-muted)]/50 mb-3" />
            <p className="text-[var(--color-admin-text)] font-medium">No complaints found</p>
            <p className="text-[var(--color-admin-muted)] text-sm">All clear!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Complaint</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Image</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-admin-text)] font-medium">{c.hosteller?.name}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5">{c.hosteller?.roll_number} • {c.hosteller?.hostel_name} R-{c.hosteller?.room_number}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-[var(--color-admin-text)] font-medium">{c.title}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5 truncate">{c.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[c.category] || CATEGORY_COLORS.general}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.image_url ? (
                        <button onClick={() => setImageModal(c.image_url)} className="p-1.5 rounded-lg bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/20 transition-colors">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[var(--color-admin-muted)] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[c.status]}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-admin-muted)] text-xs whitespace-nowrap">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {c.status === 'pending' || c.status === 'in_progress' ? (
                        <button
                          onClick={() => { setSelectedComplaint(c); setResponseText(c.admin_response || ''); }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/20 transition-colors"
                        >
                          Manage
                        </button>
                      ) : (
                        <span className="text-[var(--color-admin-muted)] text-xs italic">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setImageModal(null)}>
          <div className="relative max-w-2xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setImageModal(null)} className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-lg z-10">
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <img src={imageModal} alt="Complaint evidence" className="rounded-xl max-h-[75vh] object-contain shadow-2xl" />
          </div>
        </div>
      )}

      {/* Manage Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Manage Complaint</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Title</p>
                <p className="text-[var(--color-admin-text)] font-medium">{selectedComplaint.title}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Description</p>
                <p className="text-[var(--color-admin-text)] text-sm">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.image_url && (
                <div>
                  <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-2">Evidence</p>
                  <img src={selectedComplaint.image_url} alt="Evidence" className="rounded-lg max-h-48 object-cover border border-[var(--color-admin-border)]" />
                </div>
              )}
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Admin Response</p>
                <textarea
                  rows="3"
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Add a response or resolution note..."
                  className="admin-input resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-admin-border)]">
                {selectedComplaint.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'in_progress')}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" /> In Progress
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'rejected')}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/20 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'resolved')}
                  disabled={updating}
                  className="admin-btn-primary flex items-center gap-1.5"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
