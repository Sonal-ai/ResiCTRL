import prisma from '../../configs/prismaClient.js';

export const getAllLeavesPaginated = async ({ skip, take, status }) => {
  const where = {};
  if (status) where.status = status;

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: { hosteller: { select: { name: true, roll_number: true, hostel_name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.leave.count({ where }),
  ]);
  return [leaves, total];
};

// Keep legacy function for backward compatibility
export const getAllLeaves = async () => {
  return await prisma.leave.findMany({
    include: { hosteller: true },
    orderBy: { createdAt: 'desc' }
  });
};

// NEW — Hosteller's own leaves
export const getLeavesByHosteller = async (hostellerId) => {
  return await prisma.leave.findMany({
    where: { hostellerId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, start_date: true, end_date: true, reason: true, status: true, createdAt: true },
  });
};

export const applyLeave = async (data) => {
  return await prisma.leave.create({ data });
};

export const updateLeaveStatus = async (id, status, adminId) => {
  return await prisma.leave.update({
    where: { id },
    data: {
      status,
      approvedById: adminId
    }
  });
};

export const countActiveLeaves = async (today) => {
  return await prisma.leave.count({
    where: {
      status: 'approved',
      start_date: { lte: today },
      end_date: { gte: today }
    }
  });
};

export const findActiveLeaveForHosteller = async (hostellerId, today) => {
  return await prisma.leave.findFirst({
    where: {
      hostellerId,
      status: 'approved',
      start_date: { lte: today },
      end_date: { gte: today }
    }
  });
};
