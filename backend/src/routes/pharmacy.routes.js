import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { listItems, createItem, updateItem, deleteItem } from '../controllers/pharmacy.controller.js';

const router = Router();
router.get('/', listItems);
router.post('/', [body('name').notEmpty(), body('price').isFloat({ min: 0 })], validate, createItem);
router.put('/:id', [param('id').isMongoId()], validate, updateItem);
router.delete('/:id', [param('id').isMongoId()], validate, deleteItem);
export default router;
