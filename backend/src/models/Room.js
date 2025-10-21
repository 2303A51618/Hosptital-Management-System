import mongoose from 'mongoose';


const assignmentHistorySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  nurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  expectedDischarge: Date,
  actualDischarge: Date,
  reason: String,
  previousRoom: String,
}, { _id: false });

const cleaningLogSchema = new mongoose.Schema({
  cleanedAt: Date,
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { _id: false });

const visitorLogSchema = new mongoose.Schema({
  name: String,
  time: Date,
}, { _id: false });

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['AC', 'Non-AC'], required: true },
    occupied: { type: Boolean, default: false },
    currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    assignmentHistory: [assignmentHistorySchema],
    cleaningRequired: { type: Boolean, default: false },
    cleaningLog: [cleaningLogSchema],
    equipment: [{ type: String }],
    emergencyButtonStatus: { type: String, enum: ['Active', 'Inactive'], default: 'Inactive' },
    lastCleaned: Date,
    nextCleaning: Date,
    costPerDay: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    insuranceStatus: { type: String, enum: ['Insured', 'Uninsured', 'Pending'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
    visitorLog: [visitorLogSchema],
    notes: [{ staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String, createdAt: Date }],
    communication: [{ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, message: String, createdAt: Date }],
    qrCode: String,
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
