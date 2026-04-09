import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, UserMinus, Activity, Zap, Loader2 } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import { getDashboardMetrics, getRecentScans, getAllStudents } from '../services/api';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    studentsInside: 0,
    studentsOutside: 0,
    studentsOnLeave: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [simData, setSimData] = useState({ student_id: '', type: 'entry' });
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsRes, scansRes] = await Promise.all([
        getDashboardMetrics(),
        getRecentScans()
      ]);
      setMetrics(metricsRes.data);
      setRecentScans(scansRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // In production, you might want to uncomment this to poll or use WebSockets
    // const interval = setInterval(fetchData, 5000);
    // return () => clearInterval(interval);
  }, []);

  const handleOpenSim = async () => {
    setIsSimModalOpen(true);
    try {
      const res = await getAllStudents();
      setStudents(res.data);
      if(res.data.length > 0) setSimData(prev => ({ ...prev, student_id: res.data[0].id }));
    } catch(err) {
      console.error(err);
    }
  };

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      await axios.post('http://localhost:5000/api/scans/processScan', {
        student_id: simData.student_id,
        type: simData.type,
        timestamp: new Date().toISOString(),
        ocr_confidence: 0.98,
        model_confidence: 0.99,
        camera_id: 'cam-sim-1'
      });
      setIsSimModalOpen(false);
      fetchData(); // Refresh UI after scan
    } catch(err) {
      console.error("Simulation failed:", err);
      alert("Simulation failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-pulse flex flex-col items-center"><Activity size={40} className="text-brand-500 mb-4 animate-spin" /><p className="text-slate-500">Loading metrics...</p></div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Overview</h1>
          <p className="text-slate-500 mt-1">Real-time occupancy and attendance metrics</p>
        </div>
        <button 
          onClick={handleOpenSim}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all"
        >
          <Zap size={18} className="text-amber-400" /> Simulate Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Students" 
          value={metrics.totalStudents} 
          icon={<Users size={24} className="text-blue-500" />} 
          colorClass="bg-blue-500 text-blue-500"
        />
        <MetricCard 
          title="Inside Hostel" 
          value={metrics.studentsInside} 
          icon={<UserCheck size={24} className="text-emerald-500" />} 
          colorClass="bg-emerald-500 text-emerald-500"
          trend={2.4}
        />
        <MetricCard 
          title="Outside Hostel" 
          value={metrics.studentsOutside} 
          icon={<UserX size={24} className="text-rose-500" />} 
          colorClass="bg-rose-500 text-rose-500"
        />
        <MetricCard 
          title="On Leave" 
          value={metrics.studentsOnLeave} 
          icon={<UserMinus size={24} className="text-amber-500" />} 
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      <div className="glass-card shadow-sm border overflow-hidden mt-8 rounded-2xl">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Recent Camera Scans</h2>
          <span className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><Activity size={16} /> Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Student</th>
                <th className="px-6 py-4 font-medium tracking-wider">Room</th>
                <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                <th className="px-6 py-4 font-medium tracking-wider">Time</th>
                <th className="px-6 py-4 font-medium tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{scan.student.name}</td>
                  <td className="px-6 py-4">{scan.student.room_number || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      scan.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {scan.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(scan.timestamp), 'PPpp')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${scan.ocr_confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(scan.ocr_confidence * 100).toFixed(0)}%` }}></div>
                       </div>
                       <span className="text-xs">{Math.round(scan.ocr_confidence * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {recentScans.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent scans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Modal */}
      <Modal isOpen={isSimModalOpen} onClose={() => setIsSimModalOpen(false)} title="Simulate Camera Scan">
        <form onSubmit={handleSimulateScan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
            <select 
              value={simData.student_id} 
              onChange={e => setSimData({...simData, student_id: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Scan Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="entry" checked={simData.type === 'entry'} onChange={e => setSimData({...simData, type: e.target.value})} className="text-brand-500" />
                <span>Entry Scan</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="exit" checked={simData.type === 'exit'} onChange={e => setSimData({...simData, type: e.target.value})} className="text-rose-500" />
                <span>Exit Scan</span>
              </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={() => setIsSimModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button disabled={isSimulating || students.length===0} type="submit" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all font-medium disabled:opacity-70">
              {isSimulating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              Execute Scan
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;
