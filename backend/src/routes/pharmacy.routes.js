import { Router } from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listItems, createItem, updateItem, deleteItem } from '../controllers/pharmacy.controller.js';

const router = Router();
router.get('/', protect, authorize('Admin', 'Billing'), listItems);
router.post('/', protect, authorize('Admin', 'Billing'), [body('name').notEmpty(), body('price').isFloat({ min: 0 })], validate, createItem);
router.put('/:id', protect, authorize('Admin', 'Billing'), [param('id').isMongoId()], validate, updateItem);
router.delete('/:id', protect, authorize('Admin'), [param('id').isMongoId()], validate, deleteItem);
export default router;
