import prisma from '../../configs/prismaClient.js';

export const createScanEvent = async (data) => {
  return await prisma.scanEvent.create({ data });
};

export const getRecentScans = async (limit) => {
  return await prisma.scanEvent.findMany({
    take: limit,
    orderBy: { timestamp: 'desc' },
    include: { hosteller: { select: { name: true, roll_number: true, room_number: true } } }
  });
};
