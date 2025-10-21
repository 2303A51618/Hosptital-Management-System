import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createCheckout, stripeWebhook } from '../controllers/payments.controller.js';

const router = Router();
router.post('/bill/:id/checkout', protect, authorize('Admin', 'Billing'), createCheckout);
router.post('/stripe/webhook', (req, res, next) => next(), stripeWebhook);
export default router;
