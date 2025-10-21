import crypto from 'crypto';
import { stripe, razorpay } from '../utils/payment.js';
import { Bill } from '../models/Bill.js';
import { env } from '../config/env.js';

export const createCheckout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gateway = 'Razorpay' } = req.body;
    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    if (gateway === 'Stripe' && stripe) {
      const pi = await stripe.paymentIntents.create({ amount: bill.total * 100, currency: 'inr', metadata: { billId: bill._id.toString() } });
      return res.json({ gateway, clientSecret: pi.client_secret });
    }
    if (gateway === 'Razorpay' && razorpay) {
      const order = await razorpay.orders.create({ amount: bill.total * 100, currency: 'INR', notes: { billId: bill._id.toString() } });
      return res.json({ gateway, order, keyId: env.RAZORPAY_KEY_ID });
    }
    return res.status(400).json({ message: 'Payment gateway not configured' });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req, res, next) => {
  try {
    if (!stripe) return res.status(400).end();
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const billId = event.data.object.metadata?.billId;
      if (billId) await Bill.findByIdAndUpdate(billId, { status: 'Paid', gateway: 'Stripe', gatewayRef: event.data.object.id });
    }
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
