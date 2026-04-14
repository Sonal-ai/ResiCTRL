'use client';
import { useState, useEffect } from 'react';
import { Calendar, FileText, Send, Loader2 } from 'lucide-react';
import { applyLeave } from '../../lib/api';

export default function ApplyLeavePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hostellerId, setHostellerId] = useState('');
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Load hostellerId from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('hostellerId');
    if (storedId) setHostellerId(storedId);
  }, []);

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
    } catch (err) {
      console.error(err);
      alert('Failed to apply for leave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-campus-text)]">Apply Leave</h1>
        <p className="text-[var(--color-campus-muted)] text-sm mt-1">Submit your leave request for warden approval.</p>
      </div>

      {success ? (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-center py-10">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-2">Request Sent!</h2>
          <p className="text-emerald-700 dark:text-emerald-500/80">Your leave application has been submitted and is pending approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="campus-card space-y-6">
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
              rows="4" 
              placeholder="Please explain why you need leave..."
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
              className="campus-input resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="campus-btn-primary w-full mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Submit Application
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
