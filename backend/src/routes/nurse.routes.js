import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listShifts, createShift, updateShift, deleteShift } from '../controllers/nurse.controller.js';

const router = Router();
router.get('/', listShifts);
router.post('/', [body('nurseName').notEmpty(), body('start').isISO8601(), body('end').isISO8601()], validate, createShift);
router.put('/:id', [param('id').isMongoId()], validate, updateShift);
router.delete('/:id', [param('id').isMongoId()], validate, deleteShift);
export default router;
