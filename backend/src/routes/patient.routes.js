import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { validate } from '../middleware/validate.js';
import { listPatients, createPatient, updatePatient, deletePatient, uploadReport, getPatientCount, getPatientDetails } from '../controllers/patient.controller.js';

const upload = multer({ dest: 'tmp/' });
const router = Router();

router.get('/', listPatients);
router.get('/count', getPatientCount);
router.get('/:id/details', [param('id').isMongoId()], validate, getPatientDetails);
router.post('/', [body('name').notEmpty()], validate, createPatient);
router.put('/:id', [param('id').isMongoId()], validate, updatePatient);
router.delete('/:id', [param('id').isMongoId()], validate, deletePatient);
router.post('/:id/reports', upload.single('file'), uploadReport);

export default router;
