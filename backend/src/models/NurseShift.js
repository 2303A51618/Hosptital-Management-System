import mongoose from 'mongoose';

const nurseShiftSchema = new mongoose.Schema(
  {
    nurseName: { type: String, required: true },
    nurseId: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    ward: { type: String },
  },
  { timestamps: true }
);

export const NurseShift = mongoose.model('NurseShift', nurseShiftSchema);
