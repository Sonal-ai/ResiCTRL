const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const leaveController = require('../controllers/leaveController');
const scanController = require('../controllers/scanController');
const dashboardController = require('../controllers/dashboardController');

// Student Routes
router.get('/students', studentController.getAllStudents);
router.get('/students/:id', studentController.getStudentById);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);

// Leave Routes
router.get('/leaves', leaveController.getAllLeaves);
router.post('/leaves/apply', leaveController.applyLeave);
router.put('/leaves/:id/approve', leaveController.approveLeave);
router.put('/leaves/:id/reject', leaveController.rejectLeave);

// Camera Scan Routes (Entry/Exit)
router.post('/processScan', scanController.processScan);
router.get('/scans/recent', scanController.getRecentScans);

// Dashboard Routes
router.get('/dashboard/metrics', dashboardController.getMetrics);
router.get('/dashboard/violations', dashboardController.getCurfewViolations);

module.exports = router;
