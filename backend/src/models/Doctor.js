import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    slots: [{ start: String, end: String }],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: {
      type: String,
      enum: ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Gynecologist', 'ENT', 'General'],
      required: true,
      index: true,
    },
    experienceYears: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    email: { type: String },
    phone: { type: String },
    image: {
      url: String,
      publicId: String,
    },
    availability: [availabilitySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
