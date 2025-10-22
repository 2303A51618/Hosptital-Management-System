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

// Allow multiple origins in dev/production via CLIENT_ORIGINS (comma-separated) or single CLIENT_ORIGIN
const allowedOrigins = (env.CLIENT_ORIGINS || env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
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
initSocket(server, { cors: { origin: allowedOrigins.length ? allowedOrigins : true, credentials: true } });

server.listen(env.PORT, () => {
  console.log(`API running on port ${env.PORT}`);
});
