import * as attendanceRepository from '../models/repositories/attendanceRepository.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * GET /api/attendance/register
 * Returns the attendance register — each student with their day-by-day status
 * for a given date range. Like a school attendance register.
 * 
 * Query params:
 *   startDate (required) — ISO date string e.g. 2026-04-01
 *   endDate   (required) — ISO date string e.g. 2026-04-18
 *   hostel    (optional) — filter by hostel name
 */
export const getAttendanceRegister = async (req, res) => {
  try {
    const { startDate, endDate, hostel } = req.query;

    if (!startDate || !endDate) {
      return sendError(res, 'startDate and endDate query params are required', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendError(res, 'Invalid date format. Use YYYY-MM-DD', 400);
    }

    if (start > end) {
      return sendError(res, 'startDate must be before endDate', 400);
    }

    // Cap range at 90 days to prevent huge queries
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    if (diffDays > 90) {
      return sendError(res, 'Date range cannot exceed 90 days', 400);
    }

    // Get all students with their attendance records in this range
    const hostellers = await attendanceRepository.getAttendanceSummary({
      startDate: start,
      endDate: end,
      hostel,
    });

    // Build the date columns array
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // Transform: for each student, create a date→status map
    const register = hostellers.map(student => {
      const statusMap = {};
      let present = 0, absent = 0, onLeave = 0;

      student.attendanceRecords.forEach(r => {
        const dateKey = new Date(r.date).toISOString().split('T')[0];
        statusMap[dateKey] = r.status;
        if (r.status === 'PRESENT') present++;
        else if (r.status === 'ABSENT') absent++;
        else if (r.status === 'ON_LEAVE') onLeave++;
      });

      const totalDays = present + absent + onLeave;
      const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : null;

      return {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        hostel_name: student.hostel_name,
        room_number: student.room_number,
        attendance: statusMap,  // { "2026-04-01": "PRESENT", "2026-04-02": "ABSENT", ... }
        stats: { present, absent, onLeave, total: totalDays, percentage },
      };
    });

    sendSuccess(res, { dates, register, totalStudents: register.length });
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/attendance/date-range
 * Returns the oldest and newest attendance record dates.
 * Used by the frontend date picker to know the available range.
 */
export const getDateRange = async (req, res) => {
  try {
    const range = await attendanceRepository.getAttendanceDateRange();
    sendSuccess(res, range);
  } catch (error) {
    sendError(res, error.message);
  }
};
