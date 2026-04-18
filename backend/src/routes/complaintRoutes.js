import express from 'express';
import * as complaintController from '../controllers/complaintController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public (authenticated): get category tree for complaint form
router.get('/categories', protect, complaintController.getCategories);

// Hosteller: submit a complaint (with optional image)
router.post('/', protect, authorizeRoles('HOSTELLER'), upload.single('image'), complaintController.createComplaint);

// Hosteller: get own complaints
router.get('/my', protect, authorizeRoles('HOSTELLER'), complaintController.getMyComplaints);

// Admin: get complaint statistics (with category + priority breakdowns)
router.get('/stats', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.getComplaintStats);

// Admin: get all complaints (supports ?status=PENDING&category=WATER_ISSUES&priority=HIGH filters)
router.get('/', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.getAllComplaints);

// Admin: update complaint status + priority
router.put('/:id/status', protect, authorizeRoles('WARDEN', 'ATTENDANT'), complaintController.updateComplaintStatus);

export default router;
