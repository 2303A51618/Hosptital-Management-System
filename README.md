
# Hosptital-Management-System

# Global Next-Gen Hospital Management System

**Full-Stack Cloud-Ready Hospital Management Web Application**  
Built with React.js, Node.js, Express.js, MongoDB Atlas, Cloudinary, and deployment-ready for Render & Vercel.

---

## 🚀 Features

### Backend (Node.js + Express + MongoDB Atlas)
- **JWT Authentication** with HTTP-only secure cookies (no localStorage)
- **Role-Based Access Control (RBAC)**: Admin, Doctor, Receptionist, Billing
- **CRUD Modules**:
  - Doctors (specialty, availability, images via Cloudinary)
  - Patients (Aadhaar, reports upload, transaction history)
  - Rooms (AC/Non-AC, real-time occupancy via Socket.IO)
  - Appointments (conflict detection for doctor+room, email/SMS reminders)
  - Billing (auto-calculate taxes, generate PDF invoices, upload to Cloudinary)
  - Pharmacy inventory
  - Lab test booking & result uploads
  - Ambulance dispatch with GPS tracking fields
  - Nurse shift scheduling
- **Analytics Dashboard**: Revenue, appointments, room occupancy
- **Real-time Updates**: Socket.IO for room occupancy and appointment changes
- **Payments**: Razorpay and Stripe integration with secure webhook handling
- **Notifications**: Nodemailer (email) + Twilio (SMS)
- **File Uploads**: Cloudinary for doctor images, patient reports, lab results, invoices
- **Security**: Helmet, CORS (env-based origin), rate limiting, trust proxy for cloud deployments

### Frontend (React.js + Chakra UI)
- **Protected Routes** with role-based access
- **Pages**: Login, Dashboard (analytics charts), Doctors, Patients, Rooms (real-time status), Appointments (interactive calendar), Billing (PDF + Razorpay checkout)
- **Real-time**: Socket.IO client for live room and appointment updates
- **Payment Flow**: Razorpay checkout integration with order creation
- **Axios API Client**: Environment-based baseURL, automatic token refresh via `/auth/refresh`
- **Responsive UI**: Chakra UI components with Framer Motion animations
- **Internationalization Ready**: i18next setup for multi-language (English/Hindi/Telugu)

---

## 📁 Project Structure

```
Hospitalsystem/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js
│   │   ├── controllers/     # auth, doctor, patient, room, appointment, billing, etc.
│   │   ├── middleware/      # auth.js, roleCheck.js, errorHandler.js, validate.js
│   │   ├── models/          # User, Doctor, Patient, Room, Appointment, Bill, etc.
│   │   ├── routes/          # auth.routes.js, doctor.routes.js, etc.
│   │   └── utils/           # mailer.js, smsService.js, cloudinary.js, payment.js, pdf.js, socket.js
│   ├── scripts/
│   │   └── seed.js          # Seed Indian doctors, rooms, admin user
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/         # AuthContext.jsx
│   │   ├── pages/           # Login, Dashboard, Doctors, Patients, Rooms, Appointments, Billing
│   │   ├── services/        # api.js (Axios with withCredentials)
│   │   ├── utils/           # loadRazorpay.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier is fine)
- Cloudinary account for image/file storage
- Optional: SMTP credentials (Gmail/SendGrid), Twilio for SMS, Razorpay/Stripe for payments

---

## 🔧 Backend Setup

1. **Navigate to backend folder**:
   ```powershell
   cd "c:\Users\PC\Hospitalsystem\backend"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Edit `.env` and fill in:
     ```env
     NODE_ENV=production
     PORT=8080
     CLIENT_ORIGIN=https://your-frontend.vercel.app
     MONGODB_URI=mongodb+ ...
     JWT_SECRET=your_super_secret_key_here_1
     JWT_REFRESH_SECRET=your_refresh_secret_here_1
     JWT_EXPIRES_IN=15m
     JWT_REFRESH_EXPIRES_IN=7d
     COOKIE_SECURE=true
     COOKIE_SAMESITE=None
     
     # Seed admin
     ADMIN_EMAIL=admin@example.com
     ADMIN_PASSWORD=ChangeMe123!
     
     # Mail (optional)
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     MAIL_FROM="Hospital System <no-reply@yourdomain.com>"
     
     # Twilio (optional)
     TWILIO_ACCOUNT_SID=
     TWILIO_AUTH_TOKEN=
     TWILIO_FROM=
     
     # Cloudinary (required for uploads)
     CLOUDINARY_CLOUD_NAME=your-cloud-name
     CLOUDINARY_API_KEY=your-api-key
     CLOUDINARY_API_SECRET=your-api-secret
     
     # Razorpay (optional)
     RAZORPAY_KEY_ID=rzp_test_xxx
     RAZORPAY_KEY_SECRET=xxx
     
     # Stripe (optional)
     STRIPE_SECRET_KEY=sk_test_xxx
     STRIPE_WEBHOOK_SECRET=whsec_xxx
     ```

4. **Seed database** (creates admin user, sample doctors, rooms):
   ```powershell
   npm run seed
   ```

5. **Start development server**:
   ```powershell
   npm run dev
   ```
   API runs on `http://localhost:8080` (or your PORT). Health check: `/health`

---

## 🎨 Frontend Setup

1. **Navigate to frontend folder**:
   ```powershell
   cd "c:\Users\PC\Documents\web projects\Hospitalsystem\frontend"
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Edit `.env`:
     ```env
     REACT_APP_API_URL=http://localhost:8080/api
     REACT_APP_SOCKET_URL=http://localhost:8080
     ```
     ⚠️ **For production**: Use your deployed backend URL (no localhost).

4. **Start development server**:
   ```powershell
   npm start
   ```
   Frontend runs on `http://localhost:3000`.

5. **Login**:
   - Email: `admin@example.com` (or the ADMIN_EMAIL you set)
   - Password: `ChangeMe123!` (or the ADMIN_PASSWORD you set)

---

## 🌍 Deployment

### Backend Deployment (Render / AWS / Railway)

#### Using Render:
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Build command: `npm install`
4. Start command: `npm start`
5. Add **Environment Variables**:
   - Copy all values from `.env` into Render's environment settings
   - Set `CLIENT_ORIGIN` to your deployed frontend URL (e.g., `https://your-app.vercel.app`)
   - Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=None` for cross-origin cookies
6. Deploy and note your backend URL (e.g., `https://your-backend.onrender.com`)

### Frontend Deployment (Vercel / Netlify)

#### Using Vercel:
1. Install Vercel CLI or use the Vercel dashboard
2. Connect your repository
3. Build command: `npm run build` (auto-detected)
4. Output directory: `build`
5. Add **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```
6. Deploy!

#### Using Netlify:
1. Drag & drop `build/` folder or connect via Git
2. Build command: `npm run build`
3. Publish directory: `build`
4. Environment variables: Same as Vercel above

---

## 🔐 Security Notes

- **Cookies**: HTTPOnly, Secure, SameSite=None for cross-origin deployment
- **CORS**: Backend only accepts requests from `CLIENT_ORIGIN`
- **JWT**: Short-lived access tokens (15m) + refresh tokens (7d) in secure cookies
- **Rate Limiting**: 300 requests per 15 minutes per IP on `/api/*`
- **Helmet**: Security headers enabled
- **Trust Proxy**: Enabled for cloud platforms behind reverse proxies

---

## 📊 API Endpoints

Base URL: `https://your-backend.onrender.com/api`

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns cookies)
- `POST /auth/logout` - Logout (clears cookies)
- `GET /auth/me` - Get current user (protected)
- `POST /auth/refresh` - Refresh access token

### Doctors
- `GET /doctors` - List doctors
- `POST /doctors` - Create (Admin only)
- `PUT /doctors/:id` - Update (Admin only)
- `DELETE /doctors/:id` - Delete (Admin only)

### Patients
- `GET /patients` - List/search patients
- `POST /patients` - Create (Admin, Receptionist)
- `PUT /patients/:id` - Update
- `DELETE /patients/:id` - Delete (Admin)
- `POST /patients/:id/reports` - Upload report (multipart)

### Rooms
- `GET /rooms` - List rooms with occupancy
- `POST /rooms` - Create room (Admin)
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room (Admin)

### Appointments
- `GET /appointments?from=&to=&doctor=&room=` - List appointments
- `POST /appointments` - Create (conflict detection)
- `PUT /appointments/:id` - Update
- `DELETE /appointments/:id` - Cancel

### Billing
- `GET /billing?patient=` - List bills
- `POST /billing` - Create bill with PDF generation
- `POST /billing/:id/pay` - Mark as paid

### Payments
- `POST /payments/bill/:id/checkout` - Create Razorpay/Stripe checkout
- `POST /payments/stripe/webhook` - Stripe webhook handler

### Analytics
- `GET /analytics` - Dashboard metrics (revenue, appointments, occupancy)

### Other Modules
- `/pharmacy`, `/lab`, `/ambulance`, `/nurse` - CRUD operations
- `POST /uploads` - Generic file upload to Cloudinary

---

## 🧪 Testing

### Manual Testing Flow:
1. Register/login as Admin
2. Create doctors via `/doctors` page
3. Create patients via `/patients` page
4. Create rooms via Postman/API client (UI can be added)
5. Book appointments via `/appointments` calendar
6. Generate bills via Billing page
7. Test Razorpay checkout with test keys
8. Check real-time updates: open Rooms page in two tabs, assign/release patient

### Automated Tests:
- Add Jest/Mocha tests for controllers
- Add React Testing Library for frontend components

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CLIENT_ORIGIN` in backend `.env` matches your frontend URL **exactly** (no trailing slash)
- Check browser console for the exact origin being blocked

### Cookies Not Sent
- Ensure `COOKIE_SECURE=true` and both frontend/backend use HTTPS in production
- Set `COOKIE_SAMESITE=None` for cross-origin
- Axios must use `withCredentials: true` (already configured in `api.js`)

### MongoDB Connection Issues
- Check MongoDB Atlas IP whitelist (allow `0.0.0.0/0` for cloud services)
- Verify connection string format and credentials

### File Upload Failures
- Verify Cloudinary credentials
- Check `tmp/` directory is writable

### Payment Webhook Not Working
- For Stripe: Configure webhook endpoint in Stripe dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:8080/api/payments/stripe/webhook`

---

## 📝 TODO / Future Enhancements

- [ ] Add drag-and-drop room assignment UI
- [ ] Doctor profile pages with availability editor
- [ ] Multi-language i18n (Hindi, Telugu)
- [ ] Dark mode toggle
- [ ] Advanced analytics charts with drill-down
- [ ] Prescription tracking module
- [ ] Lab result viewer with image annotations
- [ ] Mobile app (React Native)
- [ ] Audit log viewer UI
- [ ] Email/SMS notification templates editor

---

## 📜 License

MIT License - Feel free to use for personal or commercial projects.

---

## 👨‍💻 Developer

Built by **2303A51618** as a global, cloud-ready, production-grade hospital management system for Indian hospitals and clinics.

---

## 🙏 Acknowledgments

- React.js, Node.js, Express.js, MongoDB, Mongoose
- Chakra UI for beautiful components
- Cloudinary for asset management
- Razorpay & Stripe for payment processing
- Socket.IO for real-time features

---

**Ready to deploy and scale globally!** 🚀

