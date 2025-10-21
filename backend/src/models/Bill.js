import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    label: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    items: [itemSchema],
    taxPercent: { type: Number, default: 18 },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
    currency: { type: String, default: 'INR' },
    pdfUrl: String,
    pdfPublicId: String,
    gateway: { type: String, enum: ['Razorpay', 'Stripe', 'Cash'], default: 'Razorpay' },
    gatewayRef: String,
  },
  { timestamps: true }
);

billSchema.index({ patient: 1, createdAt: -1 });

export const Bill = mongoose.model('Bill', billSchema);
