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
    name: { type: String, required: true, index: true },
    specialty: {
      type: String,
      enum: ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Gynecologist', 'ENT', 'General'],
      required: true,
      index: true,
    },
    experienceYears: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    email: { type: String, index: true },
    phone: { type: String, index: true },
    image: {
      url: String,
      publicId: String,
    },
    availability: [availabilitySchema],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
