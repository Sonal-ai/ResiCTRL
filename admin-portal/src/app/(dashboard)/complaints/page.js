'use client';
import { useEffect, useState } from 'react';
import { MessageSquareWarning, CheckCircle, XCircle, Clock, Loader2, X, Search, Image as ImageIcon, AlertTriangle, Filter } from 'lucide-react';
import { getComplaints, updateComplaintStatus } from '../../../lib/api';
import { format } from 'date-fns';

const STATUS_COLORS = {
  PENDING: 'bg-amber-500/10 text-amber-500',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500',
  RESOLVED: 'bg-emerald-500/10 text-emerald-500',
  REJECTED: 'bg-red-500/10 text-red-500',
  // Legacy lowercase
  pending: 'bg-amber-500/10 text-amber-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  resolved: 'bg-emerald-500/10 text-emerald-500',
  rejected: 'bg-red-500/10 text-red-500',
};

const PRIORITY_COLORS = {
  LOW: 'bg-emerald-500/10 text-emerald-500',
  MEDIUM: 'bg-amber-500/10 text-amber-500',
  HIGH: 'bg-orange-500/10 text-orange-500',
  URGENT: 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20',
};

const CATEGORIES = {
  WATER_ISSUES: { label: 'Water Issues', icon: '💧' },
  ELECTRICITY: { label: 'Electricity', icon: '⚡' },
  MESS_FOOD: { label: 'Mess / Food', icon: '🍽️' },
  FURNITURE: { label: 'Furniture', icon: '🪑' },
  HYGIENE: { label: 'Hygiene', icon: '🧼' },
  SAFETY: { label: 'Safety', icon: '🚨' },
  GENERAL: { label: 'General', icon: '📋' },
};

const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [updating, setUpdating] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await getComplaints(params);
      const data = res.data?.data || res.data || [];
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [statusFilter, categoryFilter, priorityFilter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(true);
    try {
      const body = { status, admin_response: responseText };
      if (newPriority) body.priority = newPriority;
      await updateComplaintStatus(id, body);
      setSelectedComplaint(null);
      setResponseText('');
      setNewPriority('');
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert('Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const openManageModal = (c) => {
    setSelectedComplaint(c);
    setResponseText(c.admin_response || '');
    setNewPriority(c.priority || '');
  };

  const filtered = complaints.filter(c =>
    (c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.hosteller?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.hosteller?.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.subcategory?.toLowerCase().includes(search.toLowerCase()))
  );

  // Sort: URGENT first, then HIGH, then by date
  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...filtered].sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 2;
    const pb = priorityOrder[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">Complaints</h1>
        <p className="text-[var(--color-admin-muted)] text-sm">Review, prioritize, and resolve hosteller complaints.</p>
      </div>

      <div className="admin-card overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-[var(--color-admin-border)] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-admin-muted)]" />
            <input
              type="text"
              placeholder="Search by title, student, or issue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-input w-auto min-w-[130px]">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="admin-input w-auto min-w-[150px]">
            <option value="">All Categories</option>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="admin-input w-auto min-w-[130px]">
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <MessageSquareWarning className="w-12 h-12 text-[var(--color-admin-muted)]/50 mb-3" />
            <p className="text-[var(--color-admin-text)] font-medium">No complaints found</p>
            <p className="text-[var(--color-admin-muted)] text-sm">All clear!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Complaint</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Image</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {sorted.map(c => {
                  const catInfo = CATEGORIES[c.category];
                  const isUrgent = c.priority === 'URGENT' || c.priority === 'HIGH';
                  return (
                    <tr key={c.id} className={`hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${isUrgent && c.status !== 'RESOLVED' && c.status !== 'REJECTED' ? 'bg-red-500/[0.02]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="text-[var(--color-admin-text)] font-medium">{c.hosteller?.name}</div>
                        <div className="text-[var(--color-admin-muted)] text-xs mt-0.5">{c.hosteller?.roll_number} • {c.hosteller?.hostel_name} R-{c.hosteller?.room_number}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="text-[var(--color-admin-text)] font-medium">{c.title}</div>
                        <div className="text-[var(--color-admin-muted)] text-xs mt-0.5 truncate">{c.description}</div>
                        {c.subcategory && (
                          <div className="text-[10px] text-[var(--color-admin-muted)] mt-0.5 italic">{c.subcategory}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          {catInfo && <span>{catInfo.icon}</span>}
                          <span className="text-[var(--color-admin-text)]">{catInfo?.label || c.category}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.MEDIUM}`}>
                          {c.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.image_url ? (
                          <button onClick={() => setImageModal(c.image_url)} className="p-1.5 rounded-lg bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/20 transition-colors">
                            <ImageIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[var(--color-admin-muted)] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[c.status] || STATUS_COLORS.PENDING}`}>
                          {(c.status || 'PENDING').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-admin-muted)] text-xs whitespace-nowrap">
                        {format(new Date(c.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {(c.status === 'PENDING' || c.status === 'IN_PROGRESS' || c.status === 'pending' || c.status === 'in_progress') ? (
                          <button
                            onClick={() => openManageModal(c)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/20 transition-colors"
                          >
                            Manage
                          </button>
                        ) : (
                          <span className="text-[var(--color-admin-muted)] text-xs italic">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* ── Manage Complaint Modal (with priority override) ── */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Manage Complaint</h3>
                <p className="text-sm text-[var(--color-admin-muted)]">
                  {CATEGORIES[selectedComplaint.category]?.icon} {CATEGORIES[selectedComplaint.category]?.label || selectedComplaint.category}
                  {selectedComplaint.subcategory && ` — ${selectedComplaint.subcategory}`}
                </p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Title</p>
                <p className="text-[var(--color-admin-text)] font-medium">{selectedComplaint.title}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Description</p>
                <p className="text-[var(--color-admin-text)] text-sm">{selectedComplaint.description}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Student</p>
                  <p className="text-sm text-[var(--color-admin-text)]">{selectedComplaint.hosteller?.name} ({selectedComplaint.hosteller?.roll_number})</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm text-[var(--color-admin-text)]">{selectedComplaint.hosteller?.hostel_name} R-{selectedComplaint.hosteller?.room_number}</p>
                </div>
              </div>
              {selectedComplaint.image_url && (
                <div>
                  <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-2">Evidence</p>
                  <img src={selectedComplaint.image_url} alt="Evidence" className="rounded-lg max-h-48 object-cover border border-[var(--color-admin-border)]" />
                </div>
              )}

              {/* Priority Override */}
              <div>
                <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider mb-1">Priority</p>
                <div className="flex gap-1.5">
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newPriority === p ? PRIORITY_COLORS[p] + ' ring-2' : 'bg-black/5 dark:bg-white/5 text-[var(--color-admin-muted)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Response */}
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
                {(selectedComplaint.status === 'PENDING' || selectedComplaint.status === 'pending') && (
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'IN_PROGRESS')}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" /> In Progress
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'REJECTED')}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedComplaint.id, 'RESOLVED')}
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
