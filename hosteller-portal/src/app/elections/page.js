'use client';
import { useState, useEffect } from 'react';
import { Vote, CheckCircle, Loader2, Trophy, Clock, Users, AlertTriangle } from 'lucide-react';
import { getActiveElection, castVote, getElectionResults } from '../../lib/api';
import AuthGuard from '../../components/AuthGuard';
import { format } from 'date-fns';

const POSITION_ICONS = {
  'President': '👑',
  'Mess Secretary': '🍽️',
  'Cultural Secretary': '🎭',
  'Sports Secretary': '⚽',
};

export default function ElectionPage() {
  const [election, setElection] = useState(null);
  const [myVotes, setMyVotes] = useState({});  // { position: candidateId }
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);  // position being voted
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [success, setSuccess] = useState('');

  const fetchElection = async () => {
    try {
      const res = await getActiveElection();
      const data = res.data?.data || res.data;
      if (data) {
        setElection(data);
        const votesMap = {};
        (data.myVotes || []).forEach(v => { votesMap[v.position] = v.candidateId; });
        setMyVotes(votesMap);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchElection(); }, []);

  const handleVote = async (candidateId, position, candidateName) => {
    if (myVotes[position]) return;
    if (!confirm(`Vote for ${candidateName} as ${position}? This cannot be undone.`)) return;

    setVoting(position);
    try {
      await castVote({ candidateId, position, electionId: election.id });
      setMyVotes({ ...myVotes, [position]: candidateId });
      setSuccess(`You voted for ${candidateName} as ${position}!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const viewResults = async () => {
    try {
      const res = await getElectionResults(election.id);
      setResults(res.data?.data || res.data);
      setShowResults(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Results not available yet');
    }
  };

  // Group candidates by position
  const groupedCandidates = {};
  if (election?.candidates) {
    election.candidates.forEach(c => {
      if (!groupedCandidates[c.position]) groupedCandidates[c.position] = [];
      groupedCandidates[c.position].push(c);
    });
  }

  return (
    <AuthGuard>
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)] flex items-center gap-2">
          <Vote className="w-6 h-6 text-[var(--color-campus-accent)]" /> Elections
        </h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Vote for your hostel committee representatives.</p>
      </div>

      {/* Success */}
      {success && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="font-semibold text-emerald-800 dark:text-emerald-400">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-campus-accent)]" /></div>
      ) : !election ? (
        <div className="campus-card text-center py-12">
          <Vote className="w-12 h-12 text-[var(--color-campus-muted)]/30 mx-auto mb-3" />
          <p className="text-[var(--color-campus-text)] font-medium">No active election</p>
          <p className="text-[var(--color-campus-muted)] text-sm mt-1">Elections will appear here when announced.</p>
        </div>
      ) : (
        <>
          {/* Election Header */}
          <div className="campus-card bg-gradient-to-r from-[var(--color-campus-accent)]/10 to-violet-500/10 border-[var(--color-campus-accent)]/20">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-lg text-[var(--color-campus-text)]">{election.title}</h2>
                <p className="text-sm text-[var(--color-campus-muted)] mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(election.start_date), 'MMM d')} — {format(new Date(election.end_date), 'MMM d, yyyy')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
          </div>

          {/* Positions + Candidates */}
          {Object.entries(groupedCandidates).map(([position, candidates]) => {
            const hasVoted = !!myVotes[position];
            const votedFor = myVotes[position];
            return (
              <div key={position} className="space-y-3">
                <h3 className="font-bold text-[var(--color-campus-text)] flex items-center gap-2">
                  <span className="text-lg">{POSITION_ICONS[position] || '🗳️'}</span> {position}
                  {hasVoted && <span className="text-xs text-emerald-500 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Voted</span>}
                </h3>
                <div className="grid gap-3">
                  {candidates.map(c => {
                    const isVotedFor = votedFor === c.id;
                    return (
                      <div key={c.id} className={`campus-card flex items-center gap-4 transition-all ${isVotedFor ? 'ring-2 ring-emerald-500/50 bg-emerald-500/5' : ''}`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-campus-accent)]/20 to-violet-500/20 flex items-center justify-center text-sm font-bold text-[var(--color-campus-accent)] shrink-0">
                          {c.hosteller?.image_url ? (
                            <img src={c.hosteller.image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            c.hosteller?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-campus-text)]">{c.hosteller?.name}</p>
                          <p className="text-xs text-[var(--color-campus-muted)]">{c.hosteller?.roll_number}</p>
                          {c.manifesto && <p className="text-xs text-[var(--color-campus-muted)] mt-1 italic">"{c.manifesto}"</p>}
                        </div>
                        <div className="shrink-0">
                          {isVotedFor ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Voted</span>
                          ) : hasVoted ? (
                            <span className="text-xs text-[var(--color-campus-muted)]">—</span>
                          ) : (
                            <button
                              onClick={() => handleVote(c.id, position, c.hosteller?.name)}
                              disabled={voting === position}
                              className="campus-btn-primary text-xs px-4 py-2"
                            >
                              {voting === position ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Vote'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* View Results */}
          <button onClick={viewResults} className="campus-card text-center py-4 flex items-center justify-center gap-2 text-[var(--color-campus-accent)] font-medium hover:bg-[var(--color-campus-accent)]/5 transition-colors">
            <Trophy className="w-5 h-5" /> View Results
          </button>
        </>
      )}

      {/* Results Modal */}
      {showResults && results && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowResults(false)}>
          <div className="bg-[var(--color-campus-card)] border border-[var(--color-campus-border)] rounded-xl w-full max-w-md shadow-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[var(--color-campus-border)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[var(--color-campus-text)] flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Results</h3>
                <p className="text-xs text-[var(--color-campus-muted)] mt-0.5">{results.totalVoters} voters participated</p>
              </div>
              <button onClick={() => setShowResults(false)} className="text-[var(--color-campus-muted)]">✕</button>
            </div>
            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(80vh-80px)]">
              {Object.entries(results.positions || {}).map(([position, candidates]) => (
                <div key={position}>
                  <h4 className="text-xs font-bold text-[var(--color-campus-muted)] uppercase tracking-wider mb-2">{POSITION_ICONS[position] || '🗳️'} {position}</h4>
                  {candidates.map((c, i) => {
                    const maxVotes = candidates[0]?.voteCount || 1;
                    const pct = Math.max(5, (c.voteCount / maxVotes) * 100);
                    return (
                      <div key={c.id} className="flex items-center gap-3 mb-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-sm font-medium text-[var(--color-campus-text)] truncate">{c.name} {i === 0 && '🏆'}</span>
                            <span className="text-xs font-bold text-[var(--color-campus-accent)]">{c.voteCount}</span>
                          </div>
                          <div className="w-full h-2 bg-[var(--color-campus-border)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${i === 0 ? 'bg-[var(--color-campus-accent)]' : 'bg-[var(--color-campus-muted)]/30'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
