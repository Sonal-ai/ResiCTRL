import prisma from '../../configs/prismaClient.js';

export const createComplaint = async (data) => {
  return await prisma.complaint.create({
    data,
    include: { hosteller: { select: { name: true, roll_number: true, hostel_name: true, room_number: true } } }
  });
};

export const getAllComplaints = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;

  return await prisma.complaint.findMany({
    where,
    include: {
      hosteller: { select: { name: true, roll_number: true, hostel_name: true, room_number: true } },
      resolvedBy: { select: { name: true, designation: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getComplaintsByHosteller = async (hostellerId) => {
  return await prisma.complaint.findMany({
    where: { hostellerId },
    orderBy: { createdAt: 'desc' }
  });
};

export const getComplaintById = async (id) => {
  return await prisma.complaint.findUnique({
    where: { id },
    include: {
      hosteller: { select: { name: true, roll_number: true, hostel_name: true, room_number: true } },
      resolvedBy: { select: { name: true, designation: true } }
    }
  });
};

export const updateComplaintStatus = async (id, status, adminId, adminResponse) => {
  return await prisma.complaint.update({
    where: { id },
    data: {
      status,
      resolvedById: adminId,
      admin_response: adminResponse || null
    },
    include: {
      hosteller: { select: { name: true, roll_number: true } },
      resolvedBy: { select: { name: true } }
    }
  });
};

export const countComplaintsByStatus = async () => {
  const [pending, inProgress, resolved, rejected] = await Promise.all([
    prisma.complaint.count({ where: { status: 'pending' } }),
    prisma.complaint.count({ where: { status: 'in_progress' } }),
    prisma.complaint.count({ where: { status: 'resolved' } }),
    prisma.complaint.count({ where: { status: 'rejected' } }),
  ]);
  return { pending, inProgress, resolved, rejected, total: pending + inProgress + resolved + rejected };
};
