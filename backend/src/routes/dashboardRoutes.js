import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboardController.js';

router.get('/metrics', dashboardController.getMetrics);
router.get('/violations', dashboardController.getCurfewViolations);
router.get('/summary', dashboardController.getDashboardSummary);

export default router;
