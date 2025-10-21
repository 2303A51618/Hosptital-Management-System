import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointment.controller.js';

const router = Router();
router.get('/', protect, listAppointments);
router.post(
	'/',
	protect,
	authorize('Admin', 'Receptionist', 'Doctor'),
	[body('doctor').isMongoId(), body('patient').isMongoId(), body('start').isISO8601(), body('end').isISO8601()],
	validate,
	createAppointment
);
router.put('/:id', protect, authorize('Admin', 'Receptionist', 'Doctor'), [param('id').isMongoId()], validate, updateAppointment);
router.delete('/:id', protect, authorize('Admin', 'Receptionist'), [param('id').isMongoId()], validate, deleteAppointment);
export default router;
