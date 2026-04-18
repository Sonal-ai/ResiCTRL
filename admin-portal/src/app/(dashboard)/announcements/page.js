'use client';
import { useEffect, useState } from 'react';
import { Megaphone, Plus, Loader2, X, Pencil, Trash2, Calendar } from 'lucide-react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../lib/api';
import { format } from 'date-fns';

const CATEGORIES = ['EVENT', 'NOTICE', 'URGENT', 'MESS', 'GENERAL'];
const PRIORITIES = ['NORMAL', 'IMPORTANT', 'URGENT'];

const CAT_STYLES = {
  EVENT: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: '📅' },
  NOTICE: { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: '📌' },
  URGENT: { bg: 'bg-red-500/10', text: 'text-red-500', icon: '🚨' },
  MESS: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '🍽️' },
  GENERAL: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: '📋' },
};

const PRIORITY_STYLES = {
  NORMAL: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
  IMPORTANT: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  URGENT: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

const EMPTY_FORM = { title: '', content: '', category: 'GENERAL', priority: 'NORMAL', hostel_name: '', expiry_date: '' };

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements({ includeExpired: 'true' });
      setAnnouncements(res.data?.data || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openCreate = () => { setEditing(null); setFormData(EMPTY_FORM); setShowForm(true); };
  const openEdit = (a) => {
    setEditing(a);
    setFormData({
      title: a.title, content: a.content, category: a.category, priority: a.priority,
      hostel_name: a.hostel_name || '', expiry_date: a.expiry_date ? format(new Date(a.expiry_date), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...formData,
        hostel_name: formData.hostel_name || null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };
      if (editing) {
        await updateAnnouncement(editing.id, data);
      } else {
        await createAnnouncement(data);
      }
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { alert('Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try { await deleteAnnouncement(id); fetchAnnouncements(); }
    catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--color-admin-accent)]" /> Announcements
          </h1>
          <p className="text-[var(--color-admin-muted)] text-sm">Create and manage hostel notices and announcements.</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary"><Plus className="w-4 h-4 mr-2" /> New Announcement</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" /></div>
      ) : announcements.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Megaphone className="w-12 h-12 text-[var(--color-admin-muted)]/30 mx-auto mb-2" />
          <p className="text-[var(--color-admin-text)] font-medium">No announcements yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map(a => {
            const catStyle = CAT_STYLES[a.category] || CAT_STYLES.GENERAL;
            const priStyle = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.NORMAL;
            const isExpired = a.expiry_date && new Date(a.expiry_date) < new Date();
            return (
              <div key={a.id} className={`admin-card p-5 ${isExpired ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span>{catStyle.icon}</span>
                      <h3 className="font-semibold text-[var(--color-admin-text)]">{a.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${catStyle.bg} ${catStyle.text}`}>{a.category}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priStyle.bg} ${priStyle.text}`}>{a.priority}</span>
                      {isExpired && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">EXPIRED</span>}
                    </div>
                    <p className="text-sm text-[var(--color-admin-muted)] line-clamp-2 mt-1">{a.content}</p>
                    <p className="text-xs text-[var(--color-admin-muted)] mt-2">
                      {a.hostel_name || 'All Hostels'} • {format(new Date(a.createdAt), 'MMM d, yyyy')}
                      {a.expiry_date && ` • Expires: ${format(new Date(a.expiry_date), 'MMM d')}`}
                      {a.createdBy && ` • By ${a.createdBy.name}`}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-muted)] hover:text-[var(--color-admin-accent)] transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-admin-muted)] hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">{editing ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-[var(--color-admin-muted)]" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Title</label>
                <input required className="admin-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Content</label>
                <textarea required rows="4" className="admin-input resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Category</label>
                  <select className="admin-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_STYLES[c]?.icon} {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Priority</label>
                  <select className="admin-input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hostel (blank = all)</label>
                  <input className="admin-input" placeholder="e.g. Aryabhatta" value={formData.hostel_name} onChange={e => setFormData({...formData, hostel_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Expiry (Optional)</label>
                  <input type="datetime-local" className="admin-input" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-admin-border)]">
                <button type="button" onClick={() => setShowForm(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="admin-btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {editing ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
