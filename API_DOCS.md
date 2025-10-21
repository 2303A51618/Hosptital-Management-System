# 📖 API Documentation

**Base URL**: `http://localhost:8080/api` (local) or `https://your-backend.onrender.com/api` (production)

All authenticated routes require HTTP-only cookies set by login endpoint.

---

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "Admin",
  "phone": "+919876543210"
}
```

**Roles**: `Admin`, `Doctor`, `Receptionist`, `Billing`

**Response**: Sets `access_token` and `refresh_token` cookies
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin"
  }
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

**Response**: Sets cookies
```json
{
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

---

### Get Current User
```http
GET /api/auth/me
```
**Protected**: ✅  
**Response**:
```json
{
  "user": {
    "id": "...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

---

### Logout
```http
POST /api/auth/logout
```
**Protected**: ✅  
**Response**:
```json
{ "message": "Logged out" }
```

---

### Refresh Token
```http
POST /api/auth/refresh
```
Uses `refresh_token` cookie to issue new `access_token`.

---

## 👨‍⚕️ Doctors

### List Doctors
```http
GET /api/doctors?specialty=Cardiologist&q=Arjun
```
**Protected**: ✅  
**Query Params**:
- `specialty`: Filter by specialty
- `q`: Search by name (case-insensitive)

**Response**:
```json
[
  {
    "_id": "...",
    "name": "Dr. Arjun Mehta",
    "specialty": "Cardiologist",
    "experienceYears": 12,
    "fees": 800,
    "email": "arjun@hospital.com",
    "phone": "+919876543210",
    "image": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "hms/..."
    },
    "availability": [
      { "day": "Mon", "slots": [{ "start": "09:00", "end": "12:00" }] }
    ],
    "isActive": true
  }
]
```

---

### Create Doctor
```http
POST /api/doctors
Content-Type: application/json

{
  "name": "Dr. Neha Sharma",
  "specialty": "Dermatologist",
  "experienceYears": 8,
  "fees": 600,
  "email": "neha@hospital.com",
  "phone": "+919876543211",
  "availability": [
    { "day": "Mon", "slots": [{ "start": "10:00", "end": "14:00" }] }
  ]
}
```
**Protected**: ✅ (Admin only)  
**Response**: Created doctor object

---

### Update Doctor
```http
PUT /api/doctors/:id
Content-Type: application/json

{
  "fees": 900,
  "isActive": true
}
```
**Protected**: ✅ (Admin only)

---

### Delete Doctor
```http
DELETE /api/doctors/:id
```
**Protected**: ✅ (Admin only)

---

## 🏥 Patients

### List/Search Patients
```http
GET /api/patients?q=Sharma&gender=Male&page=1&limit=20
```
**Protected**: ✅  
**Query Params**:
- `q`: Search name, email, phone, aadhaar
- `gender`: Filter by gender
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response**:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

---

### Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543212",
  "aadhaar": "1234-5678-9012",
  "dob": "1990-05-15",
  "gender": "Male",
  "address": "123 MG Road, Bangalore",
  "emergencyContact": {
    "name": "Priya Sharma",
    "phone": "+919876543213"
  }
}
```
**Protected**: ✅ (Admin, Receptionist)

---

### Update Patient
```http
PUT /api/patients/:id
Content-Type: application/json

{
  "phone": "+919999999999"
}
```
**Protected**: ✅ (Admin, Receptionist)

---

### Delete Patient
```http
DELETE /api/patients/:id
```
**Protected**: ✅ (Admin only)

---

### Upload Patient Report
```http
POST /api/patients/:id/reports
Content-Type: multipart/form-data

file: <PDF/Image file>
name: "Blood Test Report"
```
**Protected**: ✅ (Admin, Receptionist, Doctor)  
**Response**:
```json
{
  "name": "Blood Test Report",
  "type": "application/pdf",
  "url": "https://res.cloudinary.com/...",
  "publicId": "hms/reports/..."
}
```

---

## 🛏️ Rooms

### List Rooms
```http
GET /api/rooms
```
**Protected**: ✅  
**Response**:
```json
[
  {
    "_id": "...",
    "number": "101",
    "type": "AC",
    "occupied": false,
    "currentPatient": null
  }
]
```

---

### Create Room
```http
POST /api/rooms
Content-Type: application/json

{
  "number": "102",
  "type": "Non-AC"
}
```
**Protected**: ✅ (Admin)

---

### Assign Patient to Room
```http
POST /api/rooms/:roomId/assign
Content-Type: application/json

{
  "patientId": "..."
}
```
**Protected**: ✅ (Admin, Receptionist)  
**Real-time**: Emits `room:update` via Socket.IO

---

### Release Patient from Room
```http
POST /api/rooms/:roomId/release
```
**Protected**: ✅ (Admin, Receptionist)  
**Real-time**: Emits `room:update` via Socket.IO

---

## 📅 Appointments

### List Appointments
```http
GET /api/appointments?doctor=...&room=...&from=2025-10-20T00:00:00Z&to=2025-10-27T23:59:59Z
```
**Protected**: ✅  
**Query Params**:
- `doctor`: Filter by doctor ID
- `room`: Filter by room ID
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

**Response**:
```json
[
  {
    "_id": "...",
    "doctor": { "_id": "...", "name": "Dr. Arjun Mehta" },
    "patient": { "_id": "...", "name": "Rahul Sharma" },
    "room": { "_id": "...", "number": "101" },
    "start": "2025-10-20T10:00:00.000Z",
    "end": "2025-10-20T10:30:00.000Z",
    "status": "Scheduled",
    "notes": "Regular checkup"
  }
]
```

---

### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "doctor": "...",
  "patient": "...",
  "room": "...",
  "start": "2025-10-20T10:00:00.000Z",
  "end": "2025-10-20T10:30:00.000Z",
  "notes": "Follow-up consultation"
}
```
**Protected**: ✅ (Admin, Doctor, Receptionist)  
**Validation**: Conflict detection for doctor and room time slots  
**Notifications**: Sends email and SMS to patient  
**Real-time**: Emits `appointment:update` via Socket.IO

**Conflicts**: Returns 409 if doctor or room already booked

---

### Update Appointment
```http
PUT /api/appointments/:id
Content-Type: application/json

{
  "start": "2025-10-20T11:00:00.000Z",
  "end": "2025-10-20T11:30:00.000Z",
  "status": "Completed"
}
```
**Protected**: ✅ (Admin, Doctor, Receptionist)  
**Real-time**: Emits `appointment:update`

---

### Delete/Cancel Appointment
```http
DELETE /api/appointments/:id
```
**Protected**: ✅ (Admin, Receptionist)  
**Real-time**: Emits `appointment:update`

---

## 💰 Billing

### List Bills
```http
GET /api/billing?patient=...
```
**Protected**: ✅ (Admin, Billing)  
**Query Params**:
- `patient`: Filter by patient ID

**Response**:
```json
[
  {
    "_id": "...",
    "patient": { "_id": "...", "name": "Rahul Sharma" },
    "doctor": { "_id": "...", "name": "Dr. Arjun Mehta" },
    "items": [
      { "label": "Consultation", "quantity": 1, "unitPrice": 500, "amount": 500 },
      { "label": "Blood Test", "quantity": 1, "unitPrice": 300, "amount": 300 }
    ],
    "taxPercent": 18,
    "subtotal": 800,
    "taxAmount": 144,
    "total": 944,
    "status": "Pending",
    "currency": "INR",
    "pdfUrl": "https://res.cloudinary.com/...invoice.pdf",
    "gateway": "Razorpay"
  }
]
```

---

### Create Bill
```http
POST /api/billing
Content-Type: application/json

{
  "patient": "...",
  "doctor": "...",
  "appointment": "...",
  "items": [
    { "label": "Consultation", "quantity": 1, "unitPrice": 500 },
    { "label": "X-Ray", "quantity": 1, "unitPrice": 800 }
  ],
  "taxPercent": 18,
  "currency": "INR"
}
```
**Protected**: ✅ (Admin, Billing)  
**Auto-generates**: PDF invoice, uploads to Cloudinary  
**Response**: Bill object with `pdfUrl`

---

### Mark Bill as Paid
```http
POST /api/billing/:id/pay
```
**Protected**: ✅ (Admin, Billing)

---

## 💳 Payments

### Create Checkout Session
```http
POST /api/payments/bill/:id/checkout
Content-Type: application/json

{
  "gateway": "Razorpay"
}
```
**Protected**: ✅ (Admin, Billing)  
**Supported Gateways**: `Razorpay`, `Stripe`

**Response (Razorpay)**:
```json
{
  "gateway": "Razorpay",
  "order": {
    "id": "order_...",
    "amount": 94400,
    "currency": "INR"
  },
  "keyId": "rzp_test_..."
}
```

**Response (Stripe)**:
```json
{
  "gateway": "Stripe",
  "clientSecret": "pi_...secret"
}
```

---

### Stripe Webhook (Internal)
```http
POST /api/payments/stripe/webhook
Content-Type: application/json
Stripe-Signature: t=...,v1=...

[Stripe event payload]
```
**Public endpoint** (no auth)  
**Verifies**: Webhook signature  
**Action**: Updates bill status to Paid on `payment_intent.succeeded`

---

## 💊 Pharmacy

### List Inventory
```http
GET /api/pharmacy?q=Paracetamol
```
**Protected**: ✅ (Admin, Billing)

---

### Create Item
```http
POST /api/pharmacy
Content-Type: application/json

{
  "name": "Paracetamol 500mg",
  "sku": "MED001",
  "stock": 100,
  "unit": "tablets",
  "price": 5,
  "expiry": "2026-12-31"
}
```
**Protected**: ✅ (Admin, Billing)

---

## 🧪 Lab Tests

### List Lab Tests
```http
GET /api/lab?patient=...
```
**Protected**: ✅ (Admin, Doctor, Receptionist)

---

### Create Lab Test
```http
POST /api/lab
Content-Type: application/json

{
  "name": "Complete Blood Count",
  "patient": "...",
  "doctor": "...",
  "scheduledAt": "2025-10-21T09:00:00.000Z"
}
```
**Protected**: ✅ (Admin, Doctor, Receptionist)

---

### Upload Lab Result
```http
POST /api/lab/:id/result
Content-Type: multipart/form-data

file: <PDF/Image file>
```
**Protected**: ✅ (Admin, Doctor)  
**Updates**: Test status to "Completed"

---

## 🚑 Ambulance

### List Ambulances
```http
GET /api/ambulance
```
**Protected**: ✅ (Admin, Receptionist)

---

### Create Ambulance
```http
POST /api/ambulance
Content-Type: application/json

{
  "vehicleNumber": "KA-01-AB-1234",
  "driverName": "Ravi Kumar",
  "driverPhone": "+919876543214",
  "status": "Available"
}
```
**Protected**: ✅ (Admin, Receptionist)

---

## 👩‍⚕️ Nurse Shifts

### List Shifts
```http
GET /api/nurse?from=2025-10-20T00:00:00Z&to=2025-10-27T23:59:59Z
```
**Protected**: ✅ (Admin, Receptionist)

---

### Create Shift
```http
POST /api/nurse
Content-Type: application/json

{
  "nurseName": "Priya Reddy",
  "nurseId": "N001",
  "start": "2025-10-20T08:00:00.000Z",
  "end": "2025-10-20T16:00:00.000Z",
  "ward": "ICU"
}
```
**Protected**: ✅ (Admin, Receptionist)

---

## 📊 Analytics

### Get Dashboard Metrics
```http
GET /api/analytics
```
**Protected**: ✅ (Admin, Billing)

**Response**:
```json
{
  "apptCount": 45,
  "revenue": 125000,
  "occupancy": 75
}
```

Metrics calculated for current month:
- `apptCount`: Total appointments
- `revenue`: Total revenue (INR) from bills
- `occupancy`: Percentage of rooms occupied

---

## 📤 Generic File Upload

### Upload File
```http
POST /api/uploads
Content-Type: multipart/form-data

file: <Any file>
```
**Protected**: ✅ (All roles)  
**Uploads to**: Cloudinary `hms/uploads/` folder

**Response**:
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "hms/uploads/..."
}
```

---

## 🔴 Real-time Events (Socket.IO)

Connect to: `https://your-backend.onrender.com` with `{ withCredentials: true }`

### Events Emitted by Server:

#### `room:update`
Emitted when room occupancy changes.
```javascript
{
  "roomId": "...",
  "occupied": true,
  "patient": { "id": "...", "name": "Rahul Sharma" }
}
```

#### `appointment:update`
Emitted when appointments are created/updated/deleted.
```javascript
{
  "type": "created" | "updated" | "deleted",
  "apptId": "..."
}
```

---

## 🛡️ Error Responses

All errors follow this format:
```json
{
  "message": "Error description",
  "stack": "..." // Only in development
}
```

### Common HTTP Status Codes:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate or conflict (e.g., appointment time clash)
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Validation Errors (422):
```json
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

**For more details, see the [README.md](./README.md) and [QUICKSTART.md](./QUICKSTART.md)**
