import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    scheduledAt: { type: Date },
    status: { type: String, enum: ['Booked', 'In-Progress', 'Completed'], default: 'Booked' },
    resultUrl: String,
    resultPublicId: String,
  },
  { timestamps: true }
);

export const LabTest = mongoose.model('LabTest', labTestSchema);
