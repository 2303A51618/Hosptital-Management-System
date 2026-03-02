import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Doctor } from '../models/Doctor.js';
import { Room } from '../models/Room.js';
import { Patient } from '../models/Patient.js';

const specialties = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Gynecologist', 'ENT', 'General'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

const firstNames = ['Raj', 'Priya', 'Arjun', 'Neha', 'Vikram', 'Ananya', 'Rohan', 'Divya', 'Amit', 'Shreya', 
                    'Arun', 'Pooja', 'Sanjay', 'Nisha', 'Karan', 'Aisha', 'Deepak', 'Isha', 'Ravi', 'Sonali',
                    'Nikhil', 'Anjali', 'Suresh', 'Ritu', 'Ashok', 'Priya', 'Manoj', 'Sneha', 'Harish', 'Kavya',
                    'Vishnu', 'Anu', 'Sandeep', 'Ritika', 'Kumar', 'Meera', 'Rajesh', 'Aditi', 'Ramesh', 'Pooja'];

const lastNames = ['Singh', 'Sharma', 'Patel', 'Gupta', 'Kumar', 'Verma', 'Rao', 'Desai', 'Nair', 'Iyer'];

const diseases = ['Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Migraine', 'GERD', 'Thyroid', 'High Cholesterol'];
const allergies = ['Penicillin', 'Aspirin', 'Ibuprofen', 'Sulfa drugs', 'Codeine', 'Latex', 'Peanuts', 'Shellfish'];
const medications = ['Metformin', 'Lisinopril', 'Atorvastatin', 'Amoxicillin', 'Ibuprofen', 'Paracetamol', 'Omeprazole', 'Salbutamol'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
const getRandomEmail = (name) => `${name.toLowerCase().replace(/\s/g, '.')}${Math.floor(Math.random() * 1000)}@hospital.com`;
const getRandomPhone = () => `+91${String(Math.floor(Math.random() * 9000000000) + 1000000000).slice(-10)}`;
const getRandomArray = (arr, minLen = 1, maxLen = 3) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
  return shuffled.slice(0, len);
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Doctor.deleteMany({});
    await Room.deleteMany({});
    await Patient.deleteMany({});
    console.log('Cleared existing collections');

    // Seed 20 Doctors
    const doctors = [];
    for (let i = 1; i <= 20; i++) {
      const doctor = new Doctor({
        name: getRandomName(),
        specialty: getRandomElement(specialties),
        experienceYears: Math.floor(Math.random() * 30) + 2,
        fees: Math.floor(Math.random() * 1000) + 200,
        email: getRandomEmail(`doc${i}`),
        phone: getRandomPhone(),
        isActive: true,
        availability: [
          { day: 'Mon', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          { day: 'Tue', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          { day: 'Wed', slots: [{ start: '09:00', end: '12:00' }] },
          { day: 'Thu', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          { day: 'Fri', slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
        ],
      });
      doctors.push(doctor);
    }
    await Doctor.insertMany(doctors);
    console.log(`✓ Seeded ${doctors.length} doctors`);

    // Seed 20 Rooms
    const rooms = [];
    for (let i = 1; i <= 20; i++) {
      const room = new Room({
        number: `${100 + i}`,
        type: i <= 10 ? 'AC' : 'Non-AC',
        occupied: false,
        equipment: getRandomArray(['Oxygen', 'Monitor', 'IV Stand', 'Bed', 'Lights', 'Fan', 'AC'], 3, 5),
        emergencyButtonStatus: 'Active',
        costPerDay: i <= 10 ? 2000 : 1000,
        insuranceStatus: 'Pending',
        paymentStatus: 'Unpaid',
      });
      rooms.push(room);
    }
    await Room.insertMany(rooms);
    console.log(`✓ Seeded ${rooms.length} rooms`);

    // Seed 30+ Patients
    const patients = [];
    for (let i = 1; i <= 35; i++) {
      const dob = new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
      const admissionStatus = ['Admitted', 'Discharged', 'Pending'][Math.floor(Math.random() * 3)];
      const room = admissionStatus === 'Admitted' ? rooms[i % rooms.length] : null;
      
      const patient = new Patient({
        name: getRandomName(),
        email: getRandomEmail(`pat${i}`),
        phone: getRandomPhone(),
        aadhaar: String(Math.floor(Math.random() * 900000000000) + 100000000000),
        dob,
        gender: getRandomElement(genders),
        address: `${Math.floor(Math.random() * 1000)} Street, City, State`,
        emergencyContact: { name: getRandomName(), phone: getRandomPhone() },
        bloodGroup: getRandomElement(bloodGroups),
        allergies: getRandomArray(allergies, 1, 2),
        chronicConditions: getRandomArray(diseases, 0, 2),
        currentMedications: getRandomArray(medications, 1, 3),
        medicalHistory: getRandomArray(diseases, 0, 3),
        familyDoctor: doctors[Math.floor(Math.random() * doctors.length)],
        admissionStatus,
        room: room ? room._id : null,
        assignedDoctor: doctors[Math.floor(Math.random() * doctors.length)],
        admissionDate: admissionStatus !== 'Pending' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        expectedDischarge: admissionStatus === 'Admitted' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        actualDischarge: admissionStatus === 'Discharged' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
        insuranceProvider: ['Aditya Birla', 'HDFC', 'ICICI', 'Bajaj'][Math.floor(Math.random() * 4)],
        insurancePolicyNumber: `POL${Math.floor(Math.random() * 1000000)}`,
        billingStatus: ['Paid', 'Unpaid', 'Partial'][Math.floor(Math.random() * 3)],
        outstandingBalance: Math.floor(Math.random() * 50000),
        dietaryPreferences: getRandomArray(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'], 1, 2),
        requestedServices: getRandomArray(['Physiotherapy', 'Counseling', 'Dietitian', 'Cardiac Care'], 0, 2),
        equipmentNeeds: getRandomArray(['Wheelchair', 'Walker', 'Crutches', 'Oxygen Tank'], 0, 2),
      });
      patients.push(patient);
    }
    await Patient.insertMany(patients);
    console.log(`✓ Seeded ${patients.length} patients`);

    // Update rooms with occupied status and reference to patients
    for (let i = 0; i < Math.floor(rooms.length * 0.6); i++) {
      const room = rooms[i];
      const patient = patients[i];
      
      room.occupied = true;
      room.currentPatient = patient._id;
      room.assignmentHistory.push({
        patient: patient._id,
        doctor: patient.assignedDoctor,
        assignedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
      });
      
      await room.save();
    }
    console.log(`✓ Updated room occupancy`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Rooms: ${rooms.length}`);
    console.log(`   - Patients: ${patients.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();