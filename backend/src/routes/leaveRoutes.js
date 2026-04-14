import express from 'express';
const router = express.Router();
import * as leaveController from '../controllers/leaveController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

router.get('/', protect, leaveController.getAllLeaves);
router.post('/apply', protect, leaveController.applyLeave);
router.put('/:id/approve', protect, authorizeRoles('WARDEN'), leaveController.approveLeave);
router.put('/:id/reject', protect, authorizeRoles('WARDEN'), leaveController.rejectLeave);

export default router;
