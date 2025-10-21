import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listAmbulances, createAmbulance, updateAmbulance } from '../controllers/ambulance.controller.js';

const router = Router();
router.get('/', protect, authorize('Admin', 'Receptionist'), listAmbulances);
router.post('/', protect, authorize('Admin', 'Receptionist'), [body('vehicleNumber').notEmpty()], validate, createAmbulance);
router.put('/:id', protect, authorize('Admin', 'Receptionist'), [param('id').isMongoId()], validate, updateAmbulance);
export default router;
