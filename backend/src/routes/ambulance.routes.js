import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listAmbulances, createAmbulance, updateAmbulance } from '../controllers/ambulance.controller.js';

const router = Router();
router.get('/', listAmbulances);
router.post('/', [body('vehicleNumber').notEmpty()], validate, createAmbulance);
router.put('/:id', [param('id').isMongoId()], validate, updateAmbulance);
export default router;
