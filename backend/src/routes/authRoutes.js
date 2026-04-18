import express from 'express';
import { registerAdmin, registerHosteller, loginAdmin, loginHosteller, logoutUser, updatePassword } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/register/hosteller', registerHosteller);
router.post('/login/admin', loginAdmin);
router.post('/login/hosteller', loginHosteller);
router.post('/logout', logoutUser);

router.post('/update-password', protect, updatePassword);

// Add a quick profile route to test auth
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
