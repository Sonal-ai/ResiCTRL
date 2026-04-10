'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Loader2, X } from 'lucide-react';
import { getAllHostellers, createHosteller } from '../../lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    dob: '',
    gender: 'M',
    hostel_name: '',
    room_number: '',
    phone: '',
    guardian_contact: '',
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getAllHostellers();
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createHosteller(formData);
      setIsModalOpen(false);
      setFormData({ name: '', roll_number: '', email: '', dob: '', gender: 'M', hostel_name: '', room_number: '', phone: '', guardian_contact: '' });
      fetchStudents();
    } catch (error) {
      console.error("Failed to add student", error);
      alert('Failed to add student. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Students Directory</h1>
          <p className="text-[var(--color-admin-muted)] text-sm">Manage student records and hostel assignments.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="admin-btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-admin-border)] flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-admin-muted)]" />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <button className="admin-btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0D10] text-[#64748B] text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Student Info</th>
                  <th className="px-6 py-4 font-medium">Hostel Info</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#20242c]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{student.name}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5">{student.roll_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{student.hostel_name}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5">Room {student.room_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-admin-text)]">{student.phone}</div>
                      <div className="text-[var(--color-admin-muted)] text-xs mt-0.5 whitespace-nowrap">Guardian: {student.guardian_contact}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.is_inside ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                      }`}>
                        {student.is_inside ? 'Inside' : 'Outside'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-[var(--color-admin-muted)] hover:text-white rounded hover:bg-[#2B303B] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)] bg-[#0B0D10]">
              <h3 className="text-lg font-semibold text-white">Add New Student</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-admin-muted)] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Full Name</label>
                  <input required type="text" className="admin-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Roll Number</label>
                  <input required type="text" className="admin-input" placeholder="e.g. 2K21/CO/123" value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Email</label>
                  <input required type="email" className="admin-input" placeholder="e.g. alias@dtu.ac.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Date of Birth</label>
                  <input required type="date" className="admin-input" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Gender</label>
                  <select required className="admin-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hostel</label>
                  <input required type="text" className="admin-input" placeholder="e.g. Aryabhatta" value={formData.hostel_name} onChange={e => setFormData({...formData, hostel_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Room</label>
                  <input required type="text" className="admin-input" placeholder="e.g. 104B" value={formData.room_number} onChange={e => setFormData({...formData, room_number: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Phone</label>
                  <input required type="text" className="admin-input" placeholder="+91..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Guardian Phone</label>
                  <input required type="text" className="admin-input" placeholder="+91..." value={formData.guardian_contact} onChange={e => setFormData({...formData, guardian_contact: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-admin-border)] mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
