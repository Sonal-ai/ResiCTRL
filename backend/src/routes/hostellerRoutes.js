import express from 'express';
import { getAllHostellers, getHostellerById, createHosteller, deleteHosteller, uploadBulkCSV } from '../controllers/hostellerController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import multer from 'multer';

// Use local temporal storage for CSVs
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.get('/', protect, authorizeRoles('ATTENDANT', 'WARDEN'), getAllHostellers);
router.get('/:id', protect, getHostellerById);
router.post('/', protect, authorizeRoles('ATTENDANT', 'WARDEN'), createHosteller);
router.post('/upload-csv', protect, authorizeRoles('WARDEN', 'ATTENDANT'), upload.single('file'), uploadBulkCSV);
router.delete('/:id', protect, authorizeRoles('WARDEN', 'ATTENDANT'), deleteHosteller);

export default router;
