import * as hostellerRepository from '../models/repositories/hostellerRepository.js';
import * as leaveRepository from '../models/repositories/leaveRepository.js';

export const getMetrics = async (req, res) => {
  try {
    const totalHostellers = await hostellerRepository.countHostellers();
    
    const hostellersInside = await hostellerRepository.countHostellersByLocation('INSIDE');
    
    // Students currently on approved leave
    const today = new Date();
    const hostellersOnLeave = await leaveRepository.countActiveLeaves(today);

    const hostellersOutside = totalHostellers - hostellersInside;

    res.json({
      totalStudents: totalHostellers,
      studentsInside: hostellersInside,
      studentsOutside: hostellersOutside,
      studentsOnLeave: hostellersOnLeave
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getCurfewViolations = async (req, res) => {
  try {
    const today = new Date();
    // For this example, anyone OUTSIDE and NOT on an approved leave is a violator (assuming curfew time has passed)
    // Normally you'd check if `new Date().getHours() >= 23`
    const violators = await hostellerRepository.findCurfewViolators(today);

    res.json(violators);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
