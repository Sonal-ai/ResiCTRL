'use client';
import { useEffect, useState } from 'react';
import { Vote, Plus, Loader2, X, Users, Trophy, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getElections, createElection, getElectionById, addCandidate, getElectionResults, updateElectionStatus } from '../../../lib/api';
import { format } from 'date-fns';

const STATUS_STYLES = {
  UPCOMING: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Clock },
  ACTIVE: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle },
  ENDED: { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: Trophy },
};

const POSITIONS = ['President', 'Mess Secretary', 'Cultural Secretary', 'Sports Secretary'];

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(null);
  const [showResults, setShowResults] = useState(null);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ title: '', hostel_name: '', start_date: '', end_date: '' });
  const [candidateForm, setCandidateForm] = useState({ hostellerId: '', position: 'President', manifesto: '' });

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await getElections();
      setElections(res.data?.data || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createElection({
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      });
      setShowCreate(false);
      setFormData({ title: '', hostel_name: '', start_date: '', end_date: '' });
      fetchElections();
    } catch (err) { alert('Failed to create election'); }
    finally { setSubmitting(false); }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCandidate(showAddCandidate, candidateForm);
      setCandidateForm({ hostellerId: '', position: 'President', manifesto: '' });
      alert('Candidate added!');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateElectionStatus(id, { status });
      fetchElections();
    } catch (err) { alert('Failed to update status'); }
  };

  const viewResults = async (id) => {
    try {
      const res = await getElectionResults(id);
      setResults(res.data?.data || res.data);
      setShowResults(id);
    } catch (err) { alert('Failed to load results'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1 flex items-center gap-2">
            <Vote className="w-6 h-6 text-[var(--color-admin-accent)]" /> Elections
          </h1>
          <p className="text-[var(--color-admin-muted)] text-sm">Manage hostel committee elections and voting.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="admin-btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Create Election
        </button>
      </div>

      {/* Elections List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" /></div>
      ) : elections.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Vote className="w-12 h-12 text-[var(--color-admin-muted)]/30 mx-auto mb-2" />
          <p className="text-[var(--color-admin-text)] font-medium">No elections yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {elections.map(e => {
            const style = STATUS_STYLES[e.status] || STATUS_STYLES.UPCOMING;
            const StatusIcon = style.icon;
            return (
              <div key={e.id} className="admin-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-[var(--color-admin-text)]">{e.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${style.bg} ${style.text}`}>
                      <StatusIcon className="w-3 h-3" /> {e.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-admin-muted)]">
                    {e.hostel_name} • {format(new Date(e.start_date), 'MMM d')} — {format(new Date(e.end_date), 'MMM d, yyyy')}
                    • {e._count?.candidates || 0} candidates • {e._count?.votes || 0} votes
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {e.status === 'UPCOMING' && (
                    <>
                      <button onClick={() => setShowAddCandidate(e.id)} className="admin-btn-secondary text-xs px-3 py-1.5">Add Candidates</button>
                      <button onClick={() => handleStatusChange(e.id, 'ACTIVE')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">Start Voting</button>
                    </>
                  )}
                  {e.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => setShowAddCandidate(e.id)} className="admin-btn-secondary text-xs px-3 py-1.5">Add Candidates</button>
                      <button onClick={() => handleStatusChange(e.id, 'ENDED')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">End Election</button>
                    </>
                  )}
                  <button onClick={() => viewResults(e.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] hover:bg-[var(--color-admin-accent)]/20 transition-colors">Results</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Election Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Create Election</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-[var(--color-admin-muted)]" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Title</label>
                <input required className="admin-input" placeholder="e.g. Committee Election 2026" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hostel</label>
                <input required className="admin-input" placeholder="e.g. Aryabhatta" value={formData.hostel_name} onChange={e => setFormData({...formData, hostel_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Start</label>
                  <input required type="datetime-local" className="admin-input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">End</label>
                  <input required type="datetime-local" className="admin-input" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-admin-border)]">
                <button type="button" onClick={() => setShowCreate(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="admin-btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Add Candidate</h3>
              <button onClick={() => setShowAddCandidate(null)}><X className="w-5 h-5 text-[var(--color-admin-muted)]" /></button>
            </div>
            <form onSubmit={handleAddCandidate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hosteller ID</label>
                <input required className="admin-input" placeholder="UUID of the student" value={candidateForm.hostellerId} onChange={e => setCandidateForm({...candidateForm, hostellerId: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Position</label>
                <select className="admin-input" value={candidateForm.position} onChange={e => setCandidateForm({...candidateForm, position: e.target.value})}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Manifesto (Optional)</label>
                <textarea className="admin-input resize-none" rows="3" placeholder="Campaign statement..." value={candidateForm.manifesto} onChange={e => setCandidateForm({...candidateForm, manifesto: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-admin-border)]">
                <button type="button" onClick={() => setShowAddCandidate(null)} className="admin-btn-secondary">Close</button>
                <button type="submit" disabled={submitting} className="admin-btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && results && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Election Results</h3>
                <p className="text-sm text-[var(--color-admin-muted)]">{results.totalVoters} total voters</p>
              </div>
              <button onClick={() => { setShowResults(null); setResults(null); }}><X className="w-5 h-5 text-[var(--color-admin-muted)]" /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(80vh-80px)]">
              {Object.entries(results.positions || {}).map(([position, candidates]) => (
                <div key={position}>
                  <h4 className="text-sm font-bold text-[var(--color-admin-text)] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" /> {position}
                  </h4>
                  <div className="space-y-2">
                    {candidates.map((c, i) => {
                      const maxVotes = candidates[0]?.voteCount || 1;
                      const widthPct = Math.max(5, (c.voteCount / maxVotes) * 100);
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)]/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-[var(--color-admin-accent)] shrink-0">
                            {c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-sm font-medium text-[var(--color-admin-text)] truncate">{c.name} {i === 0 && '🏆'}</span>
                              <span className="text-xs font-bold text-[var(--color-admin-accent)]">{c.voteCount}</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--color-admin-border)] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${i === 0 ? 'bg-[var(--color-admin-accent)]' : 'bg-[var(--color-admin-muted)]/30'}`} style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
