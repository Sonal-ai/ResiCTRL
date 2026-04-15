import express from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Hosteller: submit a complaint (with optional image)
router.post('/', protect, authorizeRoles('HOSTELLER'), upload.single('image'), complaintController.createComplaint);

// Hosteller: get own complaints
router.get('/my', protect, authorizeRoles('HOSTELLER'), complaintController.getMyComplaints);

// Admin: get complaint statistics
router.get('/stats', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.getComplaintStats);

// Admin: get all complaints (supports ?status=pending&category=maintenance filters)
router.get('/', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.getAllComplaints);

// Admin: update complaint status
router.put('/:id/status', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.updateComplaintStatus);

export default router;
