const prisma = require('../prismaClient');

exports.getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

exports.applyLeave = async (req, res, next) => {
  try {
    const { studentId, start_date, end_date, reason } = req.body;
    const leave = await prisma.leave.create({
      data: {
        studentId,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        reason,
        status: 'pending'
      }
    });
    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

exports.approveLeave = async (req, res, next) => {
  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        approved_by: req.body.adminId || 'admin'
      }
    });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};

exports.rejectLeave = async (req, res, next) => {
  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        approved_by: req.body.adminId || 'admin'
      }
    });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};
