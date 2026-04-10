import express from 'express';
const router = express.Router();
import * as studentController from '../controllers/studentController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

router.get('/', protect, authorizeRoles('ATTENDANT', 'WARDEN'), studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', protect, authorizeRoles('ATTENDANT', 'WARDEN'), studentController.createStudent);
router.put('/:id', protect, authorizeRoles('ATTENDANT', 'WARDEN'), studentController.updateStudent);
router.delete('/:id', protect, authorizeRoles('ATTENDANT', 'WARDEN'), studentController.deleteStudent); // Only Warden deletes

// Protected image upload endpoint
router.post('/:id/upload-image', protect, authorizeRoles('ATTENDANT', 'WARDEN'), upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided.' });
        
        // Multer-Cloudinary automatically parses the uploaded resource URL to req.file.path
        const updatedStudent = await studentController.updateStudent({
            ...req,
            params: { id: req.params.id },
            body: { image_url: req.file.path }
        }, res, () => {});
        
        res.json({ success: true, url: req.file.path });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Image upload failed.' });
    }
});

export default router;
