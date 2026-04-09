import express from 'express';
const router = express.Router();
import * as scanController from '../controllers/scanController.js';

router.post('/processScan', scanController.processScan);
router.get('/recent', scanController.getRecentScans);

export default router;
