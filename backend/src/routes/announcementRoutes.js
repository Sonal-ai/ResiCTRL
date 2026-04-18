import express from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public (authenticated)
router.get('/meta', protect, announcementController.getMeta);
router.get('/', protect, announcementController.getAnnouncements);

// Admin only
router.post('/', protect, authorizeRoles('WARDEN', 'ATTENDANT'), announcementController.createAnnouncement);
router.put('/:id', protect, authorizeRoles('WARDEN', 'ATTENDANT'), announcementController.updateAnnouncement);
router.delete('/:id', protect, authorizeRoles('WARDEN', 'ATTENDANT'), announcementController.deleteAnnouncement);

export default router;
