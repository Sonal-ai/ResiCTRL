import prisma from '../../configs/prismaClient.js';

export const getAllLeaves = async () => {
  return await prisma.leave.findMany({
    include: { hosteller: true },
    orderBy: { createdAt: 'desc' }
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
