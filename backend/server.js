import 'dotenv/config';
import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';
import { env } from './src/config/env.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { initSocket } from './src/utils/socket.js';

// Routes
import doctorRoutes from './src/routes/doctor.routes.js';
import patientRoutes from './src/routes/patient.routes.js';
import roomRoutes from './src/routes/room.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import billingRoutes from './src/routes/billing.routes.js';
import paymentsRoutes from './src/routes/payments.routes.js';
import pharmacyRoutes from './src/routes/pharmacy.routes.js';
import labRoutes from './src/routes/lab.routes.js';
import ambulanceRoutes from './src/routes/ambulance.routes.js';
import nurseRoutes from './src/routes/nurse.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';

await connectDB();

const app = express();
app.set('trust proxy', 1);

// Security & utils
app.use(helmet());
app.use(compression());

// Allow CORS from any origin by default (safe for public API).
// If you want to restrict origins, set CLIENT_ORIGINS or CLIENT_ORIGIN in env and uncomment the check below.
app.use(cors({ origin: true, credentials: true }));
// Respond to preflight requests
app.options('*', cors({ origin: true, credentials: true }));
app.use(cookieParser());
// Stripe webhook needs raw body; mount webhook route separately before json parser
app.use('/api/payments/stripe/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limit auth and general API
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 });
app.use('/api', limiter);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Friendly root route: redirect to frontend if configured, otherwise return a simple API info JSON.
app.get('/', (req, res) => {
  try {
    if (env.CLIENT_ORIGIN) return res.redirect(env.CLIENT_ORIGIN);
    return res.json({ status: 'ok', api: true, message: 'Hospital Management API. See /health for details.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// API routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 and error
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server, { cors: { origin: true, credentials: true } });

server.listen(env.PORT, () => {
  console.log(`API running on port ${env.PORT}`);
});
