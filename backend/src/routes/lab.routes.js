import { Router } from 'express';
import multer from 'multer';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listLabTests, createLabTest, uploadResult } from '../controllers/lab.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();
router.get('/', protect, authorize('Admin', 'Doctor', 'Receptionist'), listLabTests);
router.post('/', protect, authorize('Admin', 'Doctor', 'Receptionist'), [body('name').notEmpty(), body('patient').isMongoId()], validate, createLabTest);
router.post('/:id/result', protect, authorize('Admin', 'Doctor'), [param('id').isMongoId()], validate, upload.single('file'), uploadResult);
export default router;
