import prisma from '../configs/prismaClient.js';
import { startOfDay } from 'date-fns';

// Triggered by CRON at 11:05 PM
export const processDailyAttendance = async () => {
  const today = startOfDay(new Date()); // UTC midnight representation of today
  
  const students = await prisma.student.findMany({
    where: { status: 'active' }
  });

  for (const student of students) {
    const activeLeave = await prisma.leave.findFirst({
      where: {
        studentId: student.id,
        status: 'approved',
        start_date: { lte: new Date() },
        end_date: { gte: today }
      }
    });

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
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: { studentId_date: { studentId: student.id, date: today } }
    });

    // If it doesn't already exist or wasn't processed yet
    if (!existingRecord || existingRecord.status !== attendanceStatus) {
        await prisma.attendanceRecord.upsert({
          where: {
            studentId_date: { studentId: student.id, date: today }
          },
          update: { status: attendanceStatus },
          create: {
            studentId: student.id,
            date: today,
            status: attendanceStatus
          }
        });

        // Update student tracking metrics
        if (withoutLeaveIncrement > 0 || totalAbsentIncrement > 0) {
            await prisma.student.update({
                where: { id: student.id },
                data: {
                    absent_without_leave_count: { increment: withoutLeaveIncrement },
                    total_absent_count: { increment: totalAbsentIncrement }
                }
            });
        }
    }
  }

  console.log(`Processed curfew attendance for ${students.length} students on ${today}`);
};
