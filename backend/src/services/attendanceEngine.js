import * as hostellerRepository from '../models/repositories/hostellerRepository.js';
import * as leaveRepository from '../models/repositories/leaveRepository.js';
import * as attendanceRepository from '../models/repositories/attendanceRepository.js';
import { startOfDay } from 'date-fns';

// Triggered by CRON at 11:05 PM
export const processDailyAttendance = async () => {
  const today = startOfDay(new Date()); // UTC midnight representation of today
  
  const hostellers = await hostellerRepository.findActiveHostellers();

  for (const hosteller of hostellers) {
    const activeLeave = await leaveRepository.findActiveLeaveForHosteller(hosteller.id, new Date());

    let attendanceStatus = 'ABSENT';
    let withoutLeaveIncrement = 0;
    let totalAbsentIncrement = 0;

    if (activeLeave) {
      attendanceStatus = 'ON_LEAVE';
      totalAbsentIncrement = 1;
    } else if (hosteller.current_location === 'INSIDE') {
      attendanceStatus = 'PRESENT';
    } else {
      attendanceStatus = 'ABSENT';
      withoutLeaveIncrement = 1;
      totalAbsentIncrement = 1;
    }

    // Upsert the record for today
    const existingRecord = await attendanceRepository.getAttendanceRecord(hosteller.id, today);

    // If it doesn't already exist or wasn't processed yet
    if (!existingRecord || existingRecord.status !== attendanceStatus) {
        await attendanceRepository.upsertAttendanceRecord(hosteller.id, today, attendanceStatus);

        // Update hosteller tracking metrics
        if (withoutLeaveIncrement > 0 || totalAbsentIncrement > 0) {
            await hostellerRepository.updateHosteller(hosteller.id, {
                absent_without_leave_count: { increment: withoutLeaveIncrement },
                total_absent_count: { increment: totalAbsentIncrement }
            });
        }
    }
  }

  console.log(`Processed curfew attendance for ${hostellers.length} hostellers on ${today}`);
};
