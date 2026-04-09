import prisma from '../configs/prismaClient.js';
import { startOfDay } from 'date-fns';

// Process daily attendance at Curfew (e.g. 11:00 PM)
// This can be triggered by a CRON job every day at 11:05 PM
export const processDailyAttendance = async () => {
  const today = startOfDay(new Date());
  
  // Get all students
  const students = await prisma.student.findMany({
    where: { status: 'active' }
  });

  for (const student of students) {
    // Check if on active leave
    const activeLeave = await prisma.leave.findFirst({
      where: {
        studentId: student.id,
        status: 'approved',
        start_date: { lte: new Date() },
        end_date: { gte: today }
      }
    });

    let attendanceStatus = 'ABSENT';

    if (activeLeave) {
      attendanceStatus = 'ON_LEAVE';
    } else if (student.current_location === 'INSIDE') {
      attendanceStatus = 'PRESENT';
    } else {
      // Out of hostel and no leave = ABSENT
      attendanceStatus = 'ABSENT';
    }

    // Save or update attendance record
    await prisma.attendanceRecord.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today
        }
      },
      update: { status: attendanceStatus },
      create: {
        studentId: student.id,
        date: today,
        status: attendanceStatus
      }
    });
  }

  console.log(`Processed attendance for ${students.length} students on ${today}`);
};
