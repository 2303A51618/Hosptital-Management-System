# 🚀 Quick Start Guide

## Get Running in 5 Minutes

### 1️⃣ Backend Setup

```powershell
# Navigate to backend
Set-Location "c:\Users\PC\Documents\web projects\Hospitalsystem\backend"

# Install dependencies
npm install

# Copy environment template
Copy-Item .env.example .env

# Edit .env file with your MongoDB Atlas URI and other credentials
# Minimum required:
# - MONGODB_URI (from MongoDB Atlas)
# - JWT_SECRET (any random string)
# - JWT_REFRESH_SECRET (any random string)
# - CLOUDINARY credentials (for file uploads)
# - ADMIN_EMAIL and ADMIN_PASSWORD (for first login)

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

Backend will run on `http://localhost:8080`

---

### 2️⃣ Frontend Setup

```powershell
# Navigate to frontend (open a new terminal)
Set-Location "c:\Users\PC\Documents\web projects\Hospitalsystem\frontend"

# Install dependencies
npm install

# Copy environment template
Copy-Item .env.example .env

# Edit .env and set:
# REACT_APP_API_URL=http://localhost:8080/api
# REACT_APP_SOCKET_URL=http://localhost:8080

# Start development server
npm start
```

Frontend will run on `http://localhost:3000`

---

### 3️⃣ Login & Test

1. Open `http://localhost:3000` in your browser
2. Login with:
   - **Email**: The `ADMIN_EMAIL` you set in backend `.env` (default: `admin@example.com`)
   - **Password**: The `ADMIN_PASSWORD` you set (default: `ChangeMe123!`)
3. You should see the Dashboard with analytics

---

## 🧪 Test Features

### Dashboard
- View appointments count, revenue, room occupancy

### Doctors Page
- See seeded Indian doctors (Dr. Arjun Mehta - Cardiologist, etc.)

### Patients Page
- Search and filter patients
- Upload medical reports

### Rooms Page
- See real-time room occupancy
- Open in two browser tabs and watch live updates

### Appointments Calendar
- View appointments in calendar format
- Click time slots to book (modal/form to be added)
- Real-time updates when appointments change

### Billing Page
- View bills with PDF invoices
- Click "Pay Now" for pending bills (requires Razorpay keys)

---

## 🔑 Environment Variables Quick Reference

### Backend `.env` (Minimum Required)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hospital
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=SecurePass123!
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret
CLIENT_ORIGIN=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_SOCKET_URL=http://localhost:8080
```

---

## 📚 API Testing with Postman/Thunder Client

### Create a Patient
```http
POST http://localhost:8080/api/patients
Content-Type: application/json
Cookie: access_token=<your-token>

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "gender": "Male",
  "aadhaar": "1234-5678-9012"
}
```

### Create an Appointment
```http
POST http://localhost:8080/api/appointments
Content-Type: application/json
Cookie: access_token=<your-token>

{
  "doctor": "<doctor-id>",
  "patient": "<patient-id>",
  "start": "2025-10-20T10:00:00.000Z",
  "end": "2025-10-20T10:30:00.000Z",
  "notes": "Regular checkup"
}
```

### Create a Bill
```http
POST http://localhost:8080/api/billing
Content-Type: application/json
Cookie: access_token=<your-token>

{
  "patient": "<patient-id>",
  "items": [
    { "label": "Consultation", "quantity": 1, "unitPrice": 500 },
    { "label": "Blood Test", "quantity": 1, "unitPrice": 300 }
  ],
  "taxPercent": 18
}
```

---

## 🐛 Common Issues

### "Cannot connect to MongoDB"
- Check your IP is whitelisted in MongoDB Atlas (Network Access)
- Verify connection string format
- Try allowing all IPs: `0.0.0.0/0`

### "CORS error" in browser
- Ensure `CLIENT_ORIGIN` in backend `.env` matches frontend URL exactly
- No trailing slashes
- Check browser console for the blocked origin

### "Cookies not sent"
- For localhost development, set `COOKIE_SECURE=false` in backend `.env`
- For production, both must use HTTPS

### Uploads fail
- Verify Cloudinary credentials
- Check `tmp/` folder is writable

---

## 🎯 Next Steps

1. **Add more doctors**: Use API or create an admin form
2. **Register patients**: Create patient records
3. **Book appointments**: Test conflict detection
4. **Generate bills**: Test PDF generation and Cloudinary upload
5. **Test payments**: Add Razorpay test keys and complete checkout flow
6. **Deploy**: Follow the main README.md deployment guide

---

**Happy coding! 🚀** For detailed deployment instructions, see the main [README.md](./README.md)
