import mongoose from 'mongoose';

const pharmacyItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' },
    price: { type: Number, required: true },
    expiry: { type: Date },
  },
  { timestamps: true }
);

export const PharmacyItem = mongoose.model('PharmacyItem', pharmacyItemSchema);
