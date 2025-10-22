import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { createBill, markPaid, listBills } from '../controllers/billing.controller.js';

const router = Router();
router.get('/', listBills);
router.post(
	'/',
	[body('patient').isMongoId(), body('items').isArray({ min: 1 })],
	validate,
	createBill
);
router.post('/:id/pay', [param('id').isMongoId()], validate, markPaid);
export default router;
