import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import { Doctor } from '../src/models/Doctor.js';
import { Room } from '../src/models/Room.js';
import { User } from '../src/models/User.js';

await connectDB();

const doctors = [
  { name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', experienceYears: 12, fees: 800 },
  { name: 'Dr. Neha Sharma', specialty: 'Dermatologist', experienceYears: 8, fees: 600 },
  { name: 'Dr. Ravi Kumar', specialty: 'Neurologist', experienceYears: 15, fees: 1000 },
  { name: 'Dr. Priya Iyer', specialty: 'Pediatrician', experienceYears: 9, fees: 700 },
];

const rooms = [
  { number: '101', type: 'AC' },
  { number: '102', type: 'Non-AC' },
  { number: '103', type: 'AC' },
];

await Doctor.deleteMany({});
await Room.deleteMany({});
await Doctor.insertMany(doctors);
await Room.insertMany(rooms);

await User.deleteMany({});
await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'Admin' });

console.log('Seeded doctors, rooms, and admin');
process.exit(0);
