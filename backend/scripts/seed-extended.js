import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { Doctor } from '../src/models/Doctor.js';
import { Room } from '../src/models/Room.js';
import { Patient } from '../src/models/Patient.js';
import { User } from '../src/models/User.js';

import { faker } from '@faker-js/faker';

await connectDB();

// Seed Doctors
const specialties = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Gynecologist', 'ENT', 'General'];

const doctors = Array.from({ length: 10 }).map((_, i) => ({
  name: faker.person.fullName(),
  specialty: faker.helpers.arrayElement(specialties),
  experienceYears: faker.number.int({ min: 3, max: 30 }),
  fees: faker.number.int({ min: 500, max: 1500 }),
  email: faker.internet.email(),
  phone: faker.phone.number('+91##########'),
  isActive: true,
}));

// Seed Rooms
const rooms = Array.from({ length: 20 }).map((_, i) => ({
  number: (100 + i).toString(),
  type: faker.helpers.arrayElement(['AC', 'Non-AC']),
  occupied: false,
}));

// Seed Patients
const genders = ['Male', 'Female', 'Other'];
const patients = Array.from({ length: 20 }).map(() => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('+91##########'),
  aadhaar: faker.number.int({ min: 100000000000, max: 999999999999 }).toString(),
  dob: faker.date.past(60, new Date(2005, 0, 1)),
  gender: faker.helpers.arrayElement(genders),
  address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.state() + ', India',
  emergencyContact: {
  name: faker.person.fullName(),
  phone: faker.phone.number('+91##########'),
  },
}));

await Doctor.deleteMany({});
await Room.deleteMany({});
await Patient.deleteMany({});
await User.deleteMany({});

await Doctor.insertMany(doctors);
await Room.insertMany(rooms);
await Patient.insertMany(patients);
await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'Admin' });

console.log('Seeded 10 doctors, 20 rooms, 20 Indian patients, and admin');
process.exit(0);
