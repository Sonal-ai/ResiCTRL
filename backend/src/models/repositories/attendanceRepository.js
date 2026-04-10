import prisma from '../../configs/prismaClient.js';

export const getAttendanceRecord = async (hostellerId, date) => {
  return await prisma.attendanceRecord.findUnique({
    where: { hostellerId_date: { hostellerId, date } }
  });
};

export const updateAttendanceStatus = async (id, status) => {
  return await prisma.attendanceRecord.update({
    where: { id },
    data: { status }
  });
};

export const upsertAttendanceRecord = async (hostellerId, date, status) => {
  return await prisma.attendanceRecord.upsert({
    where: {
      hostellerId_date: { hostellerId, date }
    },
    update: { status },
    create: {
      hostellerId,
      date,
      status
    }
  });
};
