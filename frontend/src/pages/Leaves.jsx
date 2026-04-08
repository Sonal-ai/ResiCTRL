import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { getAllStudents } from '../services/api';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Apply Leave Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleOpenApply = async () => {
    setIsModalOpen(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data);
      if(res.data.length > 0) setFormData(prev => ({ ...prev, studentId: res.data[0].id }));
    } catch(err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/leaves/apply', formData);
      setIsModalOpen(false);
      fetchLeaves();
    } catch (error) {
      console.error("Failed to apply leave:", error);
      alert("Failed to apply leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.put(`http://localhost:5000/api/leaves/${id}/${action}`, { adminId: 'Admin1' });
      fetchLeaves();
    } catch(err) {
      console.error(`Failed to ${action} leave`, err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-slate-500 mt-1">Review and manage student leave requests</p>
        </div>
        <button 
          onClick={handleOpenApply}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      <div className="glass-card shadow-sm border overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Student</th>
              <th className="px-6 py-4 font-medium tracking-wider">Dates</th>
              <th className="px-6 py-4 font-medium tracking-wider max-w-xs">Reason</th>
              <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
            ) : leaves.map(leave => (
              <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{leave.student.name}</td>
                <td className="px-6 py-4 text-slate-500">
                  {format(new Date(leave.start_date), 'dd MMM')} - {format(new Date(leave.end_date), 'dd MMM')}
                </td>
                <td className="px-6 py-4 truncate max-w-xs">{leave.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    leave.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                    leave.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {leave.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {leave.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => handleAction(leave.id, 'approve')} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><CheckCircle size={18} /></button>
                       <button onClick={() => handleAction(leave.id, 'reject')} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"><XCircle size={18} /></button>
                    </div>
                  ) : <span className="text-xs text-slate-400">Processed</span>}
                </td>
              </tr>
            ))}
            {!loading && leaves.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No leave requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Apply Leave Modal */}
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
            <select 
              value={formData.studentId} 
              onChange={e => setFormData({...formData, studentId: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
             <textarea required rows={3} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button disabled={isSubmitting || students.length===0} type="submit" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all font-medium disabled:opacity-70">
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              Submit Leave
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
