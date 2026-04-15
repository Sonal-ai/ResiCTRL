'use client';
import { useState, useEffect } from 'react';
import { Send, Loader2, Camera, CheckCircle, Clock, XCircle, MessageSquare, Image as ImageIcon, X } from 'lucide-react';
import { submitComplaint, getMyComplaints } from '../../lib/api';
import { format } from 'date-fns';

const STATUS_STYLES = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Pending' },
  in_progress: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Loader2, label: 'In Progress' },
  resolved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Resolved' },
  rejected: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Rejected' },
};

const CATEGORIES = [
  { value: 'general', label: '🏠 General' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'hygiene', label: '🧹 Hygiene' },
  { value: 'noise', label: '🔊 Noise' },
  { value: 'food', label: '🍽️ Food' },
  { value: 'other', label: '📋 Other' },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    image: null,
  });

  const fetchComplaints = async () => {
    try {
      const res = await getMyComplaints();
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      if (formData.image) fd.append('image', formData.image);

      await submitComplaint(fd);
      setSuccess(true);
      setFormData({ title: '', description: '', category: 'general', image: null });
      setImagePreview(null);
      fetchComplaints();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 pb-20 flex flex-col gap-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Complaints</h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Submit issues and track their resolution.</p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-400">Complaint Submitted!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500/80">The admin team will review it shortly.</p>
          </div>
        </div>
      )}

      {/* Submit Complaint Form */}
      <form onSubmit={handleSubmit} className="campus-card space-y-5">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> New Complaint
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Title</label>
          <input
            required
            type="text"
            placeholder="Brief summary of the issue..."
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="campus-input text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  formData.category === cat.value
                    ? 'border-[var(--color-campus-accent)] bg-[var(--color-campus-accent)]/10 text-[var(--color-campus-accent)]'
                    : 'border-[var(--color-campus-border)] text-[var(--color-campus-muted)] hover:border-[var(--color-campus-accent)]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Description</label>
          <textarea
            required
            rows="3"
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="campus-input resize-none text-sm"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Attach Photo (Optional)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover border border-[var(--color-campus-border)]" />
              <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-[var(--color-campus-border)] rounded-xl cursor-pointer hover:border-[var(--color-campus-accent)]/50 transition-colors">
              <Camera className="w-5 h-5 text-[var(--color-campus-muted)]" />
              <span className="text-sm text-[var(--color-campus-muted)]">Tap to add photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="campus-btn-primary w-full mt-2">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Submit Complaint <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Complaint History */}
      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--color-campus-accent)]" /> Your Complaints
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-campus-accent)]" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="campus-card text-center py-8">
            <MessageSquare className="w-10 h-10 text-[var(--color-campus-muted)]/40 mx-auto mb-2" />
            <p className="text-[var(--color-campus-muted)] text-sm">No complaints yet</p>
          </div>
        ) : (
          complaints.map(c => {
            const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
            const StatusIcon = statusStyle.icon;
            return (
              <div key={c.id} className="campus-card space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-campus-text)] truncate">{c.title}</h3>
                    <p className="text-xs text-[var(--color-campus-muted)] mt-0.5">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')} • {c.category}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusStyle.label}
                  </span>
                </div>

                <p className="text-sm text-[var(--color-campus-text)] opacity-80">{c.description}</p>

                {c.image_url && (
                  <button onClick={() => setImageModal(c.image_url)} className="flex items-center gap-1.5 text-xs text-[var(--color-campus-accent)] font-medium">
                    <ImageIcon className="w-3.5 h-3.5" /> View attached photo
                  </button>
                )}

                {c.admin_response && (
                  <div className="bg-[var(--color-campus-bg)] border border-[var(--color-campus-border)]/50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-[var(--color-campus-muted)] mb-1 font-medium">Admin Response</p>
                    <p className="text-sm text-[var(--color-campus-text)]">{c.admin_response}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setImageModal(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setImageModal(null)} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg z-10">
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <img src={imageModal} alt="Complaint" className="rounded-xl max-h-[70vh] max-w-full object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
