import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All attendance routes require authentication
router.get('/register', protect, authorizeRoles('WARDEN', 'ATTENDANT'), attendanceController.getAttendanceRegister);
router.get('/date-range', protect, attendanceController.getDateRange);

export default router;
