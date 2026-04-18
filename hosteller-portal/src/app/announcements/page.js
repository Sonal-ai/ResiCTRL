'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Loader2, Filter } from 'lucide-react';
import { getAnnouncements } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { format } from 'date-fns';

const CAT_STYLES = {
  EVENT: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: '📅' },
  NOTICE: { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: '📌' },
  URGENT: { bg: 'bg-red-500/10', text: 'text-red-500', icon: '🚨' },
  MESS: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: '🍽️' },
  GENERAL: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: '📋' },
};

const PRIORITY_STYLES = {
  NORMAL: { border: '', bg: '' },
  IMPORTANT: { border: 'border-l-4 border-l-amber-500', bg: '' },
  URGENT: { border: 'border-l-4 border-l-red-500', bg: 'bg-red-500/[0.02]' },
};

const CATEGORIES = ['', 'EVENT', 'NOTICE', 'URGENT', 'MESS', 'GENERAL'];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const res = await getAnnouncements(params);
      setAnnouncements(res.data?.data || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, [categoryFilter]);

  // Sort: URGENT priority first, then IMPORTANT, then by date
  const priorityOrder = { URGENT: 0, IMPORTANT: 1, NORMAL: 2 };
  const sorted = [...announcements].sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 2;
    const pb = priorityOrder[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <AuthGuard>
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)] flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[var(--color-campus-accent)]" /> Announcements
        </h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Stay updated with hostel notices and events.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat || 'ALL'}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-[var(--color-campus-accent)]/10 text-[var(--color-campus-accent)]'
                : 'bg-black/5 dark:bg-white/5 text-[var(--color-campus-muted)] hover:text-[var(--color-campus-text)]'
            }`}
          >
            {cat ? `${CAT_STYLES[cat]?.icon || ''} ${cat}` : '🏠 All'}
          </button>
        ))}
      </div>

      {/* Announcements */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-campus-accent)]" /></div>
      ) : sorted.length === 0 ? (
        <div className="campus-card text-center py-12">
          <Megaphone className="w-12 h-12 text-[var(--color-campus-muted)]/30 mx-auto mb-3" />
          <p className="text-[var(--color-campus-text)] font-medium">No announcements</p>
          <p className="text-[var(--color-campus-muted)] text-sm mt-1">Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => {
            const catStyle = CAT_STYLES[a.category] || CAT_STYLES.GENERAL;
            const priStyle = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.NORMAL;
            return (
              <div key={a.id} className={`campus-card ${priStyle.border} ${priStyle.bg}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{catStyle.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-[var(--color-campus-text)]">{a.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${catStyle.bg} ${catStyle.text}`}>{a.category}</span>
                      {a.priority !== 'NORMAL' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.priority === 'URGENT' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {a.priority === 'URGENT' ? '🔴 ' : '🟡 '}{a.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-campus-text)] opacity-80 whitespace-pre-wrap">{a.content}</p>
                    <p className="text-xs text-[var(--color-campus-muted)] mt-2">
                      {format(new Date(a.createdAt), 'MMM d, yyyy')}
                      {a.createdBy && ` • by ${a.createdBy.name}`}
                      {a.expiry_date && ` • Expires ${format(new Date(a.expiry_date), 'MMM d')}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
