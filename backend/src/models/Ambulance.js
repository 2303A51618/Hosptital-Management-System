import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    driverName: String,
    driverPhone: String,
    status: { type: String, enum: ['Available', 'On-Trip', 'Maintenance'], default: 'Available' },
    lastLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

export const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
