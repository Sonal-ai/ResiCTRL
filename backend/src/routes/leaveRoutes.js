import express from 'express';
const router = express.Router();
import * as leaveController from '../controllers/leaveController.js';

router.get('/', leaveController.getAllLeaves);
router.post('/apply', leaveController.applyLeave);
router.put('/:id/approve', leaveController.approveLeave);
router.put('/:id/reject', leaveController.rejectLeave);

export default router;
