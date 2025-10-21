import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true, index: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    notes: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, start: 1, end: 1 });
appointmentSchema.index({ room: 1, start: 1, end: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
