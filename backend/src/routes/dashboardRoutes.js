import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboardController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

// All dashboard routes now require authentication (previously public)
router.get('/metrics', protect, dashboardController.getMetrics);
router.get('/violations', protect, authorizeRoles('WARDEN', 'ATTENDANT'), dashboardController.getCurfewViolations);
router.get('/summary', protect, dashboardController.getDashboardSummary);

export default router;
