import prisma from '../../configs/prismaClient.js';

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id, includeStudent = false) => {
  return await prisma.user.findUnique({
    where: { id },
    include: includeStudent ? { student: true } : undefined
  });
};

export const createUser = async (data) => {
  return await prisma.user.create({ data });
};
