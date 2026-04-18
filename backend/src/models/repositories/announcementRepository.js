import prisma from '../../configs/prismaClient.js';

export const createAnnouncement = (data) =>
  prisma.announcement.create({
    data,
    include: { createdBy: { select: { name: true, designation: true } } },
  });

export const getAnnouncements = async ({ hostel, category, priority, includeExpired = false }) => {
  const where = {};

  // Show announcements for specific hostel OR global (null hostel_name)
  if (hostel) {
    where.OR = [
      { hostel_name: hostel },
      { hostel_name: null },
    ];
  }

  if (category) where.category = category;
  if (priority) where.priority = priority;

  // Exclude expired unless requested
  if (!includeExpired) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { expiry_date: null },
          { expiry_date: { gte: new Date() } },
        ],
      },
    ];
  }

  return prisma.announcement.findMany({
    where,
    include: { createdBy: { select: { name: true, designation: true } } },
    orderBy: [
      { priority: 'desc' },    // URGENT first
      { createdAt: 'desc' },
    ],
  });
};

export const getAnnouncementById = (id) =>
  prisma.announcement.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true, designation: true } } },
  });

export const updateAnnouncement = (id, data) =>
  prisma.announcement.update({
    where: { id },
    data,
    include: { createdBy: { select: { name: true, designation: true } } },
  });

export const deleteAnnouncement = (id) =>
  prisma.announcement.delete({ where: { id } });
