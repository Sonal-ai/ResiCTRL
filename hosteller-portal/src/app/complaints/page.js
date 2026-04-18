'use client';
import { useState, useEffect } from 'react';
import { Send, Loader2, Camera, CheckCircle, Clock, XCircle, MessageSquare, Image as ImageIcon, X, AlertTriangle, ChevronDown } from 'lucide-react';
import { submitComplaint, getMyComplaints } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { format } from 'date-fns';

const STATUS_STYLES = {
  PENDING: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Pending' },
  IN_PROGRESS: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Loader2, label: 'In Progress' },
  RESOLVED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Resolved' },
  REJECTED: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Rejected' },
  // Legacy lowercase compat
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'Pending' },
  in_progress: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Loader2, label: 'In Progress' },
  resolved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, label: 'Resolved' },
  rejected: { color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle, label: 'Rejected' },
};

const PRIORITY_STYLES = {
  LOW: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  MEDIUM: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  HIGH: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  URGENT: { color: 'text-red-500', bg: 'bg-red-500/10' },
};

// ── Category + Subcategory map (mirrors backend) ──
const CATEGORIES = {
  WATER_ISSUES: { label: 'Water Issues', icon: '💧', subcategories: ['Water logging', 'Water cooler not working', 'No water supply', 'Dirty water'] },
  ELECTRICITY: { label: 'Electricity', icon: '⚡', subcategories: ['Power cut', 'Faulty switch', 'Fan not working', 'Light not working'] },
  MESS_FOOD: { label: 'Mess / Food', icon: '🍽️', subcategories: ['Poor food quality', 'Unhygienic food', 'Late food service', 'Limited quantity'] },
  FURNITURE: { label: 'Furniture', icon: '🪑', subcategories: ['Table damage', 'Chair broken', 'Almirah issue', 'Door issue', 'Door handle issue', 'Bed issue'] },
  HYGIENE: { label: 'Hygiene', icon: '🧼', subcategories: ['Too many mosquitoes', 'Garbage not cleaned', 'Dirty washrooms', 'Drain blockage'] },
  SAFETY: { label: 'Safety', icon: '🚨', subcategories: ['Honeybee hive', 'Stray animals', 'Broken window', 'Unsafe wiring'] },
  GENERAL: { label: 'General', icon: '📋', subcategories: ['Other'] },
};

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
    category: '',
    subcategory: '',
    image: null,
  });

  const fetchComplaints = async () => {
    try {
      const res = await getMyComplaints();
      setComplaints(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const selectedCat = CATEGORIES[formData.category];

  const handleCategorySelect = (key) => {
    setFormData({ ...formData, category: key, subcategory: '' });
  };

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
    if (!formData.category || !formData.subcategory) {
      alert('Please select a category and subcategory');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      fd.append('subcategory', formData.subcategory);
      if (formData.image) fd.append('image', formData.image);

      await submitComplaint(fd);
      setSuccess(true);
      setFormData({ title: '', description: '', category: '', subcategory: '', image: null });
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
    <AuthGuard>
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Complaints</h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Report issues and track their resolution.</p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-400">Complaint Submitted!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500/80">The admin team will review it shortly.</p>
          </div>
        </div>
      )}

      {/* ── Submit Complaint Form ── */}
      <form onSubmit={handleSubmit} className="campus-card space-y-5">
        <h2 className="font-semibold text-[var(--color-campus-text)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-campus-accent)]" /> New Complaint
        </h2>

        {/* Category Grid */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategorySelect(key)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all border ${
                  formData.category === key
                    ? 'border-[var(--color-campus-accent)] bg-[var(--color-campus-accent)]/10 text-[var(--color-campus-accent)] shadow-sm'
                    : 'border-[var(--color-campus-border)] text-[var(--color-campus-muted)] hover:border-[var(--color-campus-accent)]/50'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Subcategory Dropdown */}
        {selectedCat && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Specific Issue</label>
            <div className="relative">
              <select
                required
                value={formData.subcategory}
                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                className="campus-input text-sm appearance-none pr-10"
              >
                <option value="">Select issue type...</option>
                {selectedCat.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-campus-muted)] pointer-events-none" />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Title</label>
          <input
            required
            type="text"
            placeholder="Brief summary of the issue..."
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="campus-input text-sm"
            minLength={3}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-campus-muted)] uppercase tracking-wider">Description</label>
          <textarea
            required
            rows="3"
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="campus-input resize-none text-sm"
            minLength={10}
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

        <button type="submit" disabled={isSubmitting || !formData.category || !formData.subcategory} className="campus-btn-primary w-full mt-2">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Submit Complaint <Send className="w-4 h-4 ml-2" /></>
          )}
        </button>
      </form>

      {/* ── Complaint History ── */}
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
            const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.PENDING;
            const priorityStyle = PRIORITY_STYLES[c.priority] || PRIORITY_STYLES.MEDIUM;
            const StatusIcon = statusStyle.icon;
            const catInfo = CATEGORIES[c.category];
            return (
              <div key={c.id} className="campus-card space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {catInfo && <span className="text-sm">{catInfo.icon}</span>}
                      <h3 className="font-semibold text-[var(--color-campus-text)] truncate">{c.title}</h3>
                    </div>
                    <p className="text-xs text-[var(--color-campus-muted)]">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')} • {catInfo?.label || c.category}
                      {c.subcategory && ` • ${c.subcategory}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusStyle.bg} ${statusStyle.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusStyle.label}
                    </span>
                    {c.priority && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityStyle.bg} ${priorityStyle.color}`}>
                        {c.priority}
                      </span>
                    )}
                  </div>
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
    </AuthGuard>
  );
}
