import prisma from '../../configs/prismaClient.js';

export const getAllLeaves = async () => {
  return await prisma.leave.findMany({
    include: { student: true },
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

export const findActiveLeaveForStudent = async (studentId, today) => {
  return await prisma.leave.findFirst({
    where: {
      studentId,
      status: 'approved',
      start_date: { lte: today },
      end_date: { gte: today }
    }
  });
};
