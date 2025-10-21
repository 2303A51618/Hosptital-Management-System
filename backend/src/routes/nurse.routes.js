import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listShifts, createShift, updateShift, deleteShift } from '../controllers/nurse.controller.js';

const router = Router();
router.get('/', protect, authorize('Admin', 'Receptionist'), listShifts);
router.post('/', protect, authorize('Admin', 'Receptionist'), [body('nurseName').notEmpty(), body('start').isISO8601(), body('end').isISO8601()], validate, createShift);
router.put('/:id', protect, authorize('Admin', 'Receptionist'), [param('id').isMongoId()], validate, updateShift);
router.delete('/:id', protect, authorize('Admin'), [param('id').isMongoId()], validate, deleteShift);
export default router;
