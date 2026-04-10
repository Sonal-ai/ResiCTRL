import * as studentRepository from '../models/repositories/studentRepository.js';
import * as leaveRepository from '../models/repositories/leaveRepository.js';

export const getMetrics = async (req, res, next) => {
  try {
    const totalStudents = await studentRepository.countStudents();
    
    const studentsInside = await studentRepository.countStudentsByLocation('INSIDE');
    
    // Students currently on approved leave
    const today = new Date();
    const studentsOnLeave = await leaveRepository.countActiveLeaves(today);

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
    const violators = await studentRepository.findCurfewViolators(today);

    res.json(violators);
  } catch (error) {
    next(error);
  }
};
