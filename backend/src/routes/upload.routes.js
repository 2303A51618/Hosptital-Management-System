import { Router } from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFile } from '../controllers/upload.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();
router.post('/', protect, authorize('Admin', 'Doctor', 'Receptionist', 'Billing'), upload.single('file'), uploadFile);
export default router;
