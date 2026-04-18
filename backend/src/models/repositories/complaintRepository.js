import prisma from '../../configs/prismaClient.js';

export const createComplaint = async (data) => {
  return await prisma.complaint.create({
    data,
    include: { hosteller: { select: { name: true, roll_number: true, hostel_name: true, room_number: true } } }
  });
};

export const getAllComplaintsPaginated = async ({ status, category, subcategory, priority, skip, take }) => {
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (subcategory) where.subcategory = { contains: subcategory, mode: 'insensitive' };
  if (priority) where.priority = priority;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        hosteller: { select: { name: true, roll_number: true, hostel_name: true, room_number: true } },
        resolvedBy: { select: { name: true, designation: true } }
      },
      orderBy: [
        // URGENT and HIGH priority first, then by date
        { createdAt: 'desc' }
      ],
      skip,
      take,
    }),
    prisma.complaint.count({ where }),
  ]);
  return [complaints, total];
};

// Legacy — keep for backward compat
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
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, description: true, category: true, subcategory: true,
      priority: true, image_url: true, status: true, admin_response: true, createdAt: true,
    }
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

export const updateComplaint = async (id, data) => {
  return await prisma.complaint.update({
    where: { id },
    data,
    include: {
      hosteller: { select: { name: true, roll_number: true } },
      resolvedBy: { select: { name: true } }
    }
  });
};

// Legacy wrapper
export const updateComplaintStatus = async (id, status, adminId, adminResponse) => {
  return updateComplaint(id, {
    status,
    resolvedById: adminId,
    admin_response: adminResponse || null,
  });
};

export const countComplaintsByStatus = async () => {
  const [pending, inProgress, resolved, rejected] = await Promise.all([
    prisma.complaint.count({ where: { status: 'PENDING' } }),
    prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.complaint.count({ where: { status: 'RESOLVED' } }),
    prisma.complaint.count({ where: { status: 'REJECTED' } }),
  ]);
  return { pending, inProgress, resolved, rejected, total: pending + inProgress + resolved + rejected };
};

export const countComplaintsByCategory = async () => {
  const result = await prisma.complaint.groupBy({
    by: ['category'],
    _count: { category: true },
    where: { status: { not: 'REJECTED' } },
  });
  const map = {};
  result.forEach(r => { map[r.category] = r._count.category; });
  return map;
};

export const countComplaintsByPriority = async () => {
  const result = await prisma.complaint.groupBy({
    by: ['priority'],
    _count: { priority: true },
    where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
  });
  const map = {};
  result.forEach(r => { map[r.priority] = r._count.priority; });
  return map;
};
