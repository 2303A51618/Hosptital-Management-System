import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listPatients, createPatient, updatePatient, deletePatient, uploadReport, getPatientCount, getPatientDetails } from '../controllers/patient.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();

router.get('/', protect, listPatients);
router.get('/count', protect, getPatientCount);
router.get('/:id/details', protect, authorize('Admin', 'Receptionist', 'Doctor', 'Nurse'), [param('id').isMongoId()], validate, getPatientDetails);
router.post('/', protect, authorize('Admin', 'Receptionist'), [body('name').notEmpty()], validate, createPatient);
router.put('/:id', protect, authorize('Admin', 'Receptionist'), [param('id').isMongoId()], validate, updatePatient);
router.delete('/:id', protect, authorize('Admin'), [param('id').isMongoId()], validate, deletePatient);
router.post('/:id/reports', protect, authorize('Admin', 'Receptionist', 'Doctor'), upload.single('file'), uploadReport);

export default router;
