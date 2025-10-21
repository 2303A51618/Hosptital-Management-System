import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBill, markPaid, listBills } from '../controllers/billing.controller.js';

const router = Router();
router.get('/', protect, authorize('Admin', 'Billing'), listBills);
router.post(
	'/',
	protect,
	authorize('Admin', 'Billing'),
	[body('patient').isMongoId(), body('items').isArray({ min: 1 })],
	validate,
	createBill
);
router.post('/:id/pay', protect, authorize('Admin', 'Billing'), [param('id').isMongoId()], validate, markPaid);
export default router;
