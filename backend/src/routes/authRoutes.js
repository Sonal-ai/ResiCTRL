import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/profile', protect, getUserProfile);

// Example of purely RBAC protected endpoint:
// router.get('/admin-only', protect, authorizeRoles('WARDEN', 'ATTENDANT'), (req, res) => res.send('Admin Data'));

export default router;
