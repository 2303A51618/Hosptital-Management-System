import { Router } from 'express';
import { createCheckout, stripeWebhook } from '../controllers/payments.controller.js';

const router = Router();
router.post('/bill/:id/checkout', createCheckout);
router.post('/stripe/webhook', (req, res, next) => next(), stripeWebhook);
export default router;
