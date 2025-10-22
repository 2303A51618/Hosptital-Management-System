import { Router } from 'express';
import { body, param } from 'express-validator';
import { listDoctors, createDoctor, updateDoctor, deleteDoctor, getDoctorCount } from '../controllers/doctor.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', listDoctors);
router.get('/count', getDoctorCount);
router.post(
  '/',
  [body('name').notEmpty(), body('specialty').notEmpty()],
  validate,
  createDoctor
);
router.put(
  '/:id',
  [param('id').isMongoId()],
  validate,
  updateDoctor
);
router.delete('/:id', [param('id').isMongoId()], validate, deleteDoctor);

export default router;
