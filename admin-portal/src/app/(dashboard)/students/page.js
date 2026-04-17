'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Loader2, X, UserCheck, UserX, Users, AlertTriangle, Upload, Pencil } from 'lucide-react';
import { getAllHostellers, createHosteller, updateHosteller, uploadHostellerCSV } from '../../../lib/api';

const LOCATION_TABS = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'INSIDE', label: 'Inside', icon: UserCheck },
  { key: 'OUTSIDE', label: 'Outside', icon: UserX },
];

const EMPTY_FORM = {
  name: '', roll_number: '', email: '', dob: '', gender: 'M',
  hostel_name: '', room_number: '', phone: '', guardian_contact: '', block: '', floor: '',
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // CSV Upload
  const [csvFile, setCsvFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editFormData, setEditFormData] = useState({});

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getAllHostellers();
      setStudents(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // ── Add Student ──
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createHosteller(formData);
      setIsAddModalOpen(false);
      setFormData(EMPTY_FORM);
      fetchStudents();
    } catch (error) {
      console.error("Failed to add student", error);
      alert('Failed to add student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit Student (NEW — Phase 3) ──
  const openEditModal = (student, e) => {
    e.stopPropagation(); // Don't navigate to profile
    setEditingStudent(student);
    setEditFormData({
      name: student.name || '',
      phone: student.phone || '',
      guardian_name: student.guardian_name || '',
      guardian_contact: student.guardian_contact || '',
      hostel_name: student.hostel_name || '',
      room_number: student.room_number || '',
      block: student.block || '',
      floor: student.floor || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateHosteller(editingStudent.id, editFormData);
      setIsEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Failed to update student", error);
      alert('Failed to update student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── CSV Upload (NEW — Phase 3) ──
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setIsSubmitting(true);
    setCsvResult(null);
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      const res = await uploadHostellerCSV(fd);
      setCsvResult(res.data);
      fetchStudents();
    } catch (error) {
      console.error("CSV upload failed", error);
      setCsvResult({ success: false, message: 'Upload failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students
    .filter(s => locationFilter === 'all' || s.current_location === locationFilter)
    .filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.hostel_name?.toLowerCase().includes(search.toLowerCase())
    );

  const getAttendancePercent = (s) => {
    if (!s.total_working_days || s.total_working_days === 0) return null;
    return Math.round((s.total_present_days / s.total_working_days) * 100);
  };

  const locationCounts = {
    all: students.length,
    INSIDE: students.filter(s => s.current_location === 'INSIDE').length,
    OUTSIDE: students.filter(s => s.current_location === 'OUTSIDE').length,
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1">Students Directory</h1>
          <p className="text-[var(--color-admin-muted)] text-sm">Manage student records, track locations, and monitor attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsCsvModalOpen(true)} className="admin-btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="admin-btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Location Filter Tabs */}
      <div className="flex items-center gap-1 bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl p-1 w-fit">
        {LOCATION_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = locationFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setLocationFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-accent)] shadow-sm'
                  : 'text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-[var(--color-admin-accent)]/20' : 'bg-black/5 dark:bg-white/5'
              }`}>
                {locationCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="admin-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[var(--color-admin-border)]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-admin-muted)]" />
            <input 
              type="text" 
              placeholder="Search by name, roll no, or hostel..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-[var(--color-admin-muted)]/30 mx-auto mb-2" />
            <p className="text-[var(--color-admin-text)] font-medium">No students found</p>
            <p className="text-[var(--color-admin-muted)] text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] text-[var(--color-admin-muted)] text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Hostel</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Attendance</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Flags</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)] text-sm">
                {filtered.map((student) => {
                  const attendance = getAttendancePercent(student);
                  const isAbsentee = student.absent_without_leave_count > 2;
                  
                  return (
                    <tr 
                      key={student.id} 
                      onClick={() => router.push(`/students/${student.id}`)} 
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)]/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-[var(--color-admin-accent)] shrink-0">
                            {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-admin-text)]">{student.name}</p>
                            <p className="text-xs text-[var(--color-admin-muted)]">{student.roll_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[var(--color-admin-text)]">{student.hostel_name}</p>
                        <p className="text-xs text-[var(--color-admin-muted)]">Room {student.room_number}{student.block ? ` • Block ${student.block}` : ''}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[var(--color-admin-text)]">{student.phone || '—'}</p>
                        <p className="text-xs text-[var(--color-admin-muted)]">{student.guardian_contact ? `Guardian: ${student.guardian_contact}` : ''}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {attendance !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[var(--color-admin-border)] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  attendance >= 75 ? 'bg-emerald-500' : attendance >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${attendance}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${
                              attendance >= 75 ? 'text-emerald-500' : attendance >= 50 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {attendance}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-admin-muted)]">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          student.current_location === 'INSIDE' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.current_location === 'INSIDE' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          {student.current_location === 'INSIDE' ? 'Inside' : 'Outside'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isAbsentee ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500" title={`${student.absent_without_leave_count} unauthorized absences`}>
                            <AlertTriangle className="w-3 h-3" />
                            {student.absent_without_leave_count} AWOL
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-admin-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => openEditModal(student, e)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-admin-accent)]/10 text-[var(--color-admin-muted)] hover:text-[var(--color-admin-accent)] transition-colors"
                          title="Edit student"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Student Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Add New Student</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Guardian Phone</label>
                  <input required type="text" className="admin-input" placeholder="+91..." value={formData.guardian_contact} onChange={e => setFormData({...formData, guardian_contact: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-admin-border)] mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Student Modal (NEW — Phase 3) ── */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Edit Student</h3>
                <p className="text-sm text-[var(--color-admin-muted)]">{editingStudent.roll_number} • {editingStudent.email}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditStudent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Full Name</label>
                  <input type="text" className="admin-input" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Phone</label>
                  <input type="text" className="admin-input" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Guardian Name</label>
                  <input type="text" className="admin-input" value={editFormData.guardian_name} onChange={e => setEditFormData({...editFormData, guardian_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Guardian Phone</label>
                  <input type="text" className="admin-input" value={editFormData.guardian_contact} onChange={e => setEditFormData({...editFormData, guardian_contact: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hostel</label>
                  <input type="text" className="admin-input" value={editFormData.hostel_name} onChange={e => setEditFormData({...editFormData, hostel_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Room</label>
                  <input type="text" className="admin-input" value={editFormData.room_number} onChange={e => setEditFormData({...editFormData, room_number: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Block</label>
                  <input type="text" className="admin-input" value={editFormData.block} onChange={e => setEditFormData({...editFormData, block: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Floor</label>
                  <input type="text" className="admin-input" value={editFormData.floor} onChange={e => setEditFormData({...editFormData, floor: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-admin-border)] mt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Updating...' : 'Update Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CSV Upload Modal (NEW — Phase 3) ── */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-admin-card)] border border-[var(--color-admin-border)] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Upload Students CSV</h3>
              <button onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); setCsvResult(null); }} className="text-[var(--color-admin-muted)] hover:text-[var(--color-admin-text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--color-admin-muted)]">
                Upload a CSV file with columns: <code className="text-xs bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">name, roll_number, email, dob, gender, hostel_name, room_number, phone, guardian_contact</code>
              </p>

              <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-[var(--color-admin-border)] rounded-xl cursor-pointer hover:border-[var(--color-admin-accent)]/50 transition-colors">
                <Upload className="w-8 h-8 text-[var(--color-admin-muted)]" />
                <span className="text-sm text-[var(--color-admin-muted)]">{csvFile ? csvFile.name : 'Click to select CSV file'}</span>
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="hidden" />
              </label>

              {csvResult && (
                <div className={`p-3 rounded-lg text-sm ${csvResult.success !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  {csvResult.message || `Added: ${csvResult.added || 0}, Failed: ${csvResult.failedRows?.length || 0}`}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); setCsvResult(null); }} className="admin-btn-secondary">Close</button>
                <button onClick={handleCsvUpload} disabled={!csvFile || isSubmitting} className="admin-btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
