import prisma from '../../configs/prismaClient.js';

export const getHostellerById = async (id) => {
  return await prisma.hosteller.findUnique({
    where: { id },
    include: {
      leaves: true,
      scanEvents: {
        orderBy: { timestamp: 'desc' },
        take: 10
      }
    }
  });
};

export const updateHosteller = async (id, data) => {
  return await prisma.hosteller.update({
    where: { id },
    data
  });
};

export const countHostellers = async () => {
  return await prisma.hosteller.count();
};

export const countHostellersByLocation = async (location) => {
  return await prisma.hosteller.count({
    where: { current_location: location }
  });
};

export const findCurfewViolators = async (today) => {
  return await prisma.hosteller.findMany({
    where: {
      current_location: 'OUTSIDE',
      leaves: {
        none: {
          status: 'approved',
          start_date: { lte: today },
          end_date: { gte: today }
        }
      }
    }
  });
};

export const findActiveHostellers = async () => {
  return await prisma.hosteller.findMany({
    where: { status: 'active' }
  });
};
