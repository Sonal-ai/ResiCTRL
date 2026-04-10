import prisma from '../../configs/prismaClient.js';

export const getAttendanceRecord = async (studentId, date) => {
  return await prisma.attendanceRecord.findUnique({
    where: { studentId_date: { studentId, date } }
  });
};

export const updateAttendanceStatus = async (id, status) => {
  return await prisma.attendanceRecord.update({
    where: { id },
    data: { status }
  });
};

export const upsertAttendanceRecord = async (studentId, date, status) => {
  return await prisma.attendanceRecord.upsert({
    where: {
      studentId_date: { studentId, date }
    },
    update: { status },
    create: {
      studentId,
      date,
      status
    }
  });
};
