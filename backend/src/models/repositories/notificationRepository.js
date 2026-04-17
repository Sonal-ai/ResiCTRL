import prisma from '../../configs/prismaClient.js';

export const createNotification = async (data) => {
  return await prisma.notification.create({ data });
};

export const getNotificationsByUser = async (userId, { skip, take }) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return [notifications, total];
};

export const getUnreadCount = async (userId) => {
  return await prisma.notification.count({ where: { userId, isRead: false } });
};

export const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
