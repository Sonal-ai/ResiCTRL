import express from 'express';
const router = express.Router();
import * as scanController from '../controllers/scanController.js';
import { protect } from '../middlewares/authMiddleware.js';

// processScan remains open for camera hardware (authenticated by camera API key in future)
router.post('/processScan', scanController.processScan);

// Recent scans now require authentication (was previously public)
router.get('/recent', protect, scanController.getRecentScans);

export default router;
