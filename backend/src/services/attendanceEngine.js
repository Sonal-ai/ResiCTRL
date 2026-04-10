import * as studentRepository from '../models/repositories/studentRepository.js';
import * as leaveRepository from '../models/repositories/leaveRepository.js';
import * as attendanceRepository from '../models/repositories/attendanceRepository.js';
import { startOfDay } from 'date-fns';

// Triggered by CRON at 11:05 PM
export const processDailyAttendance = async () => {
  const today = startOfDay(new Date()); // UTC midnight representation of today
  
  const students = await studentRepository.findActiveStudents();

  for (const student of students) {
    const activeLeave = await leaveRepository.findActiveLeaveForStudent(student.id, new Date());

    let attendanceStatus = 'ABSENT';
    let withoutLeaveIncrement = 0;
    let totalAbsentIncrement = 0;

    if (activeLeave) {
      attendanceStatus = 'ON_LEAVE';
      totalAbsentIncrement = 1;
    } else if (student.current_location === 'INSIDE') {
      attendanceStatus = 'PRESENT';
    } else {
      attendanceStatus = 'ABSENT';
      withoutLeaveIncrement = 1;
      totalAbsentIncrement = 1;
    }

    // Upsert the record for today
    const existingRecord = await attendanceRepository.getAttendanceRecord(student.id, today);

    // If it doesn't already exist or wasn't processed yet
    if (!existingRecord || existingRecord.status !== attendanceStatus) {
        await attendanceRepository.upsertAttendanceRecord(student.id, today, attendanceStatus);

        // Update student tracking metrics
        if (withoutLeaveIncrement > 0 || totalAbsentIncrement > 0) {
            await studentRepository.updateStudent(student.id, {
                absent_without_leave_count: { increment: withoutLeaveIncrement },
                total_absent_count: { increment: totalAbsentIncrement }
            });
        }
    }
  }

  console.log(`Processed curfew attendance for ${students.length} students on ${today}`);
};
