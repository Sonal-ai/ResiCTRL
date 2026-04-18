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

// ── Attendance Register Queries (NEW) ──

/**
 * Get attendance records for a date range, optionally filtered by hostel.
 * Returns records with student name/roll/hostel for the register view.
 */
export const getAttendanceRegister = async ({ startDate, endDate, hostel, search }) => {
  const where = {
    date: { gte: startDate, lte: endDate },
  };

  // Filter by hostel name if provided
  if (hostel) {
    where.hosteller = { hostel_name: { contains: hostel, mode: 'insensitive' } };
  }

  // Search by student name or roll number
  if (search) {
    where.hosteller = {
      ...where.hosteller,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { roll_number: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  return await prisma.attendanceRecord.findMany({
    where,
    include: {
      hosteller: {
        select: { id: true, name: true, roll_number: true, hostel_name: true, room_number: true }
      }
    },
    orderBy: [{ date: 'asc' }, { hosteller: { name: 'asc' } }],
  });
};

/**
 * Get attendance summary for a date range — per-student stats.
 * Returns each student's total present/absent/on_leave counts.
 */
export const getAttendanceSummary = async ({ startDate, endDate, hostel }) => {
  const hostelFilter = hostel 
    ? { hostel_name: { contains: hostel, mode: 'insensitive' } } 
    : {};

  // Get all hostellers with their attendance records in the range
  const hostellers = await prisma.hosteller.findMany({
    where: { ...hostelFilter },
    select: {
      id: true,
      name: true,
      roll_number: true,
      hostel_name: true,
      room_number: true,
      attendanceRecords: {
        where: { date: { gte: startDate, lte: endDate } },
        select: { date: true, status: true },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return hostellers;
};

/**
 * Get all unique dates that have attendance records (for date range picker context).
 */
export const getAttendanceDateRange = async () => {
  const [oldest, newest] = await Promise.all([
    prisma.attendanceRecord.findFirst({ orderBy: { date: 'asc' }, select: { date: true } }),
    prisma.attendanceRecord.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
  ]);
  return { oldest: oldest?.date, newest: newest?.date };
};
