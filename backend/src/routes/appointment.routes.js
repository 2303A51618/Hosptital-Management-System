import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointment.controller.js';

const router = Router();
router.get('/', listAppointments);
router.post(
	'/',
	[body('doctor').isMongoId(), body('patient').isMongoId(), body('start').isISO8601(), body('end').isISO8601()],
	validate,
	createAppointment
);
router.put('/:id', [param('id').isMongoId()], validate, updateAppointment);
router.delete('/:id', [param('id').isMongoId()], validate, deleteAppointment);
export default router;
