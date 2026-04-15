import * as hostellerRepository from '../models/repositories/hostellerRepository.js';
import * as leaveRepository from '../models/repositories/leaveRepository.js';
import * as complaintRepository from '../models/repositories/complaintRepository.js';
import * as scanEventRepository from '../models/repositories/scanEventRepository.js';
import prisma from '../configs/prismaClient.js';

export const getMetrics = async (req, res) => {
  try {
    const totalHostellers = await hostellerRepository.countHostellers();
    const hostellersInside = await hostellerRepository.countHostellersByLocation('INSIDE');
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
    const violators = await hostellerRepository.findCurfewViolators(today);
    res.json(violators);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Full dashboard summary — single API call for the admin dashboard
export const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();

    // Parallel fetch for speed
    const [
      totalStudents,
      studentsInside,
      studentsOnLeave,
      pendingLeaves,
      complaintStats,
      recentScans,
      outsideWithoutLeave
    ] = await Promise.all([
      hostellerRepository.countHostellers(),
      hostellerRepository.countHostellersByLocation('INSIDE'),
      leaveRepository.countActiveLeaves(today),
      prisma.leave.count({ where: { status: 'pending' } }),
      complaintRepository.countComplaintsByStatus(),
      scanEventRepository.getRecentScans(10),
      // Students OUTSIDE who do NOT have an active approved leave
      prisma.hosteller.findMany({
        where: {
          current_location: 'OUTSIDE',
          leaves: {
            none: {
              status: 'approved',
              start_date: { lte: today },
              end_date: { gte: today }
            }
          }
        },
        select: { id: true, name: true, roll_number: true, hostel_name: true, room_number: true }
      })
    ]);

    const studentsOutside = totalStudents - studentsInside;

    res.json({
      totalStudents,
      studentsInside,
      studentsOutside,
      studentsOnLeave,
      outsideWithoutLeave: outsideWithoutLeave.length,
      outsideWithoutLeaveList: outsideWithoutLeave,
      pendingLeaves,
      pendingComplaints: complaintStats.pending,
      complaintStats,
      recentScans,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
