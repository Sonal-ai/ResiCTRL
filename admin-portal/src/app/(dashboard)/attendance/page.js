'use client';
import { useEffect, useState } from 'react';
import { Calendar, Loader2, Search, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getAttendanceRegister } from '../../../lib/api';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';

const STATUS_CELL = {
  PRESENT: { label: 'P', bg: 'bg-emerald-500', text: 'text-white' },
  ABSENT:  { label: 'A', bg: 'bg-red-500', text: 'text-white' },
  ON_LEAVE: { label: 'L', bg: 'bg-amber-500', text: 'text-white' },
};

// Quick range presets
const RANGE_PRESETS = [
  { label: 'This Week', getRange: () => ({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: new Date() }) },
  { label: 'Last 7 Days', getRange: () => ({ start: subDays(new Date(), 6), end: new Date() }) },
  { label: 'Last 14 Days', getRange: () => ({ start: subDays(new Date(), 13), end: new Date() }) },
  { label: 'This Month', getRange: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'Last 30 Days', getRange: () => ({ start: subDays(new Date(), 29), end: new Date() }) },
];

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [register, setRegister] = useState([]);
  const [dates, setDates] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState('');

  // Default: last 7 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hostelFilter, setHostelFilter] = useState('');

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({ avgAttendance: 0, totalPresent: 0, totalAbsent: 0, totalLeave: 0 });

  const fetchRegister = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceRegister({
        startDate,
        endDate,
        ...(hostelFilter && { hostel: hostelFilter }),
      });
      const data = res.data?.data || res.data;
      setRegister(data.register || []);
      setDates(data.dates || []);
      setTotalStudents(data.totalStudents || 0);

      // Calculate summary
      let totalP = 0, totalA = 0, totalL = 0, totalPercent = 0, countWithData = 0;
      (data.register || []).forEach(s => {
        totalP += s.stats.present;
        totalA += s.stats.absent;
        totalL += s.stats.onLeave;
        if (s.stats.percentage !== null) {
          totalPercent += s.stats.percentage;
          countWithData++;
        }
      });
      setSummaryStats({
        avgAttendance: countWithData > 0 ? Math.round(totalPercent / countWithData) : 0,
        totalPresent: totalP,
        totalAbsent: totalA,
        totalLeave: totalL,
      });
    } catch (err) {
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegister(); }, [startDate, endDate, hostelFilter]);

  const applyPreset = (preset) => {
    const { start, end } = preset.getRange();
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  // Filter by search (client-side on already fetched data)
  const filtered = register.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  // CSV export
  const exportCSV = () => {
    const headers = ['Name', 'Roll Number', 'Hostel', 'Room', ...dates, 'Present', 'Absent', 'Leave', '%'];
    const rows = filtered.map(s => [
      s.name,
      s.roll_number,
      s.hostel_name,
      s.room_number,
      ...dates.map(d => s.attendance[d] || '-'),
      s.stats.present,
      s.stats.absent,
      s.stats.onLeave,
      s.stats.percentage !== null ? `${s.stats.percentage}%` : 'N/A',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-admin-text)] mb-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[var(--color-admin-accent)]" />
            Attendance Register
          </h1>
          <p className="text-[var(--color-admin-muted)] text-sm">
            Day-by-day attendance tracking for all students.
            {totalStudents > 0 && ` Showing ${totalStudents} students.`}
          </p>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0} className="admin-btn-secondary">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Avg Attendance</p>
          <p className={`text-2xl font-bold mt-1 ${
            summaryStats.avgAttendance >= 75 ? 'text-emerald-500' : summaryStats.avgAttendance >= 50 ? 'text-amber-500' : 'text-red-500'
          }`}>{summaryStats.avgAttendance}%</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Total Present</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{summaryStats.totalPresent}</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">Total Absent</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{summaryStats.totalAbsent}</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-xs text-[var(--color-admin-muted)] uppercase tracking-wider">On Leave</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{summaryStats.totalLeave}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="admin-card p-4 space-y-4">
        {/* Date Range */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="admin-input text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="admin-input text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Hostel</label>
            <input
              type="text"
              value={hostelFilter}
              onChange={e => setHostelFilter(e.target.value)}
              placeholder="Filter by hostel..."
              className="admin-input text-sm"
            />
          </div>
          <div className="relative flex-1 min-w-[200px] space-y-1">
            <label className="text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-admin-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or roll..."
                className="admin-input text-sm pl-10"
              />
            </div>
          </div>
        </div>

        {/* Quick Range Presets */}
        <div className="flex flex-wrap gap-1.5">
          {RANGE_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/5 dark:bg-white/5 text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-accent)]/10 hover:text-[var(--color-admin-accent)] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px]">P</span>
            Present
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-red-500 flex items-center justify-center text-white font-bold text-[10px]">A</span>
            Absent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white font-bold text-[10px]">L</span>
            On Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-[var(--color-admin-border)] flex items-center justify-center text-[var(--color-admin-muted)] font-bold text-[10px]">-</span>
            No Record
          </span>
        </div>
      </div>

      {/* Register Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-admin-accent)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-[var(--color-admin-muted)]/30 mx-auto mb-2" />
            <p className="text-[var(--color-admin-text)] font-medium">No attendance records found</p>
            <p className="text-[var(--color-admin-muted)] text-sm mt-1">Try selecting a different date range or ensure the cron job has run.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="px-4 py-3 text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider sticky left-0 bg-[var(--color-admin-card)] z-10 min-w-[180px] border-r border-[var(--color-admin-border)]">
                    Student
                  </th>
                  {dates.map(d => (
                    <th key={d} className="px-1 py-3 text-center min-w-[36px]">
                      <div className="text-[10px] text-[var(--color-admin-muted)] font-medium leading-tight">
                        <div>{format(new Date(d), 'EEE')}</div>
                        <div className="font-bold text-[var(--color-admin-text)]">{format(new Date(d), 'd')}</div>
                        <div>{format(new Date(d), 'MMM')}</div>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-xs font-medium text-[var(--color-admin-muted)] uppercase tracking-wider min-w-[50px] border-l border-[var(--color-admin-border)]">%</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-emerald-500 uppercase tracking-wider min-w-[30px]">P</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-red-500 uppercase tracking-wider min-w-[30px]">A</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-amber-500 uppercase tracking-wider min-w-[30px]">L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-admin-border)]">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    {/* Student info — sticky column */}
                    <td className="px-4 py-2.5 sticky left-0 bg-[var(--color-admin-card)] z-10 border-r border-[var(--color-admin-border)]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-admin-accent)]/20 to-violet-500/20 flex items-center justify-center text-[10px] font-bold text-[var(--color-admin-accent)] shrink-0">
                          {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--color-admin-text)] truncate">{student.name}</p>
                          <p className="text-[10px] text-[var(--color-admin-muted)]">{student.roll_number}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date cells */}
                    {dates.map(d => {
                      const status = student.attendance[d];
                      const cell = status ? STATUS_CELL[status] : null;
                      return (
                        <td key={d} className="px-1 py-2.5 text-center">
                          {cell ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${cell.bg} ${cell.text}`}
                              title={`${format(new Date(d), 'MMM d')} — ${status}`}>
                              {cell.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] bg-[var(--color-admin-border)]/50 text-[var(--color-admin-muted)]">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Summary columns */}
                    <td className="px-3 py-2.5 text-center border-l border-[var(--color-admin-border)]">
                      <span className={`text-xs font-bold ${
                        student.stats.percentage >= 75 ? 'text-emerald-500' :
                        student.stats.percentage >= 50 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {student.stats.percentage !== null ? `${student.stats.percentage}%` : '-'}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs font-medium text-emerald-500">{student.stats.present}</td>
                    <td className="px-2 py-2.5 text-center text-xs font-medium text-red-500">{student.stats.absent}</td>
                    <td className="px-2 py-2.5 text-center text-xs font-medium text-amber-500">{student.stats.onLeave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
