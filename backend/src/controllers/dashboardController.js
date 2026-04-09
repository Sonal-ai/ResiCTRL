import prisma from '../configs/prismaClient.js';

export const getMetrics = async (req, res, next) => {
  try {
    const totalStudents = await prisma.student.count();
    
    const studentsInside = await prisma.student.count({
      where: { current_location: 'INSIDE' }
    });
    
    // Students currently on approved leave
    const today = new Date();
    const studentsOnLeave = await prisma.leave.count({
      where: {
        status: 'approved',
        start_date: { lte: today },
        end_date: { gte: today }
      }
    });

    const studentsOutside = totalStudents - studentsInside;

    res.json({
      totalStudents,
      studentsInside,
      studentsOutside,
      studentsOnLeave
    });
  } catch (error) {
    next(error);
  }
};

export const getCurfewViolations = async (req, res, next) => {
  try {
    const today = new Date();
    // For this example, anyone OUTSIDE and NOT on an approved leave is a violator (assuming curfew time has passed)
    // Normally you'd check if `new Date().getHours() >= 23`
    const violators = await prisma.student.findMany({
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

    res.json(violators);
  } catch (error) {
    next(error);
  }
};
