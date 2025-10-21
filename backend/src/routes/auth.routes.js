import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me, logout, refresh } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['Admin', 'Doctor', 'Receptionist', 'Billing']),
  ],
  validate,
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.get('/me', protect, me);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);

export default router;
