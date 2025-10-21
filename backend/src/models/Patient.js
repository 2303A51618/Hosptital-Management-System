import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    url: String,
    publicId: String,
  },
  { _id: false, timestamps: true }
);


const appointmentHistorySchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  date: Date,
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  notes: String,
}, { _id: false });

const billingHistorySchema = new mongoose.Schema({
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
  status: String,
  paidAt: Date,
}, { _id: false });

const notesSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  createdAt: Date,
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  uploadedAt: Date,
}, { _id: false });

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    aadhaar: { type: String, index: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String },
    emergencyContact: { name: String, phone: String },
    photo: { type: String },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],
    medicalHistory: [{ type: String }],
    familyDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    admissionStatus: { type: String, enum: ['Admitted', 'Discharged', 'Pending'], default: 'Pending' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admissionDate: Date,
    expectedDischarge: Date,
    actualDischarge: Date,
    appointmentHistory: [appointmentHistorySchema],
    procedures: [{ type: String }],
    insuranceProvider: String,
    insurancePolicyNumber: String,
    billingStatus: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
    outstandingBalance: { type: Number, default: 0 },
    billingHistory: [billingHistorySchema],
    dietaryPreferences: [{ type: String }],
    requestedServices: [{ type: String }],
    equipmentNeeds: [{ type: String }],
    visitorLog: [{ name: String, time: Date }],
    notes: [notesSchema],
    attachments: [attachmentSchema],
    qrCode: String,
    reports: [reportSchema],
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }],
  },
  { timestamps: true }
);

export const Patient = mongoose.model('Patient', patientSchema);
