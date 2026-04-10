import prisma from '../../configs/prismaClient.js';

export const getAllStudents = async () => {
  return await prisma.student.findMany({
    orderBy: { name: 'asc' }
  });
};

export const getStudentById = async (id) => {
  return await prisma.student.findUnique({
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

export const createStudent = async (data) => {
  return await prisma.student.create({ data });
};

export const updateStudent = async (id, data) => {
  return await prisma.student.update({
    where: { id },
    data
  });
};

export const deleteStudent = async (id) => {
  return await prisma.student.delete({
    where: { id }
  });
};

export const countStudents = async () => {
  return await prisma.student.count();
};

export const countStudentsByLocation = async (location) => {
  return await prisma.student.count({
    where: { current_location: location }
  });
};

export const findCurfewViolators = async (today) => {
  return await prisma.student.findMany({
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

export const findActiveStudents = async () => {
  return await prisma.student.findMany({
    where: { status: 'active' }
  });
};
