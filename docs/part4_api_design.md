# 9. API Design

## 9.1 API Conventions

### Base URL
```
https://api.clinicdesk.com/api/v1
```

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { },
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Code Conventions

| Status Code | Usage |
|-------------|-------|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST (resource created) |
| `204 No Content` | Successful DELETE |
| `400 Bad Request` | Validation errors, malformed request |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Insufficient role/permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Duplicate resource / scheduling conflict |
| `422 Unprocessable Entity` | Business rule violation |
| `500 Internal Server Error` | Unexpected server error |

### Pagination Query Parameters
```
GET /api/v1/patients?page=1&limit=20&sort=created_at&order=desc
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order (`asc` / `desc`) |
| `search` | string | — | Global search query |

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

---

## 9.2 Auth Module (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user account | No |
| `POST` | `/auth/login` | Authenticate and receive JWT tokens | No |
| `POST` | `/auth/refresh-token` | Refresh access token using refresh token | No |
| `POST` | `/auth/forgot-password` | Request password reset email | No |
| `POST` | `/auth/reset-password` | Reset password with token | No |
| `GET` | `/auth/me` | Get current authenticated user profile | Yes (Any) |
| `PUT` | `/auth/me` | Update current user profile | Yes (Any) |
| `POST` | `/auth/change-password` | Change password (requires current password) | Yes (Any) |

### Example: POST `/auth/login`

**Request:**
```json
{
  "email": "doctor@clinicdesk.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "doctor@clinicdesk.com",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "firstNameAr": "أحمد",
      "lastNameAr": "حسن",
      "role": {
        "id": 3,
        "name": "doctor",
        "nameAr": "طبيب"
      },
      "preferredLanguage": "en",
      "avatarUrl": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "message": "Login successful"
}
```

### Example: POST `/auth/register`

**Request:**
```json
{
  "email": "receptionist@clinicdesk.com",
  "password": "SecurePass123!",
  "firstName": "Nour",
  "lastName": "Ali",
  "firstNameAr": "نور",
  "lastNameAr": "علي",
  "phone": "+966501234567",
  "preferredLanguage": "ar"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "receptionist@clinicdesk.com",
      "firstName": "Nour",
      "lastName": "Ali",
      "role": {
        "id": 2,
        "name": "receptionist"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}
```

---

## 9.3 Patients Module (`/api/v1/patients`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/patients` | List patients with pagination, search, filter | Receptionist, Doctor, Admin |
| `POST` | `/patients` | Create a new patient record | Receptionist, Admin |
| `GET` | `/patients/:id` | Get patient details by ID | Receptionist, Doctor, Admin |
| `PUT` | `/patients/:id` | Update patient information | Receptionist, Admin |
| `DELETE` | `/patients/:id` | Soft delete patient record | Admin |
| `GET` | `/patients/:id/appointments` | Get patient's appointment history | Receptionist, Doctor, Admin |
| `GET` | `/patients/:id/visits` | Get patient's visit history | Doctor, Admin |
| `GET` | `/patients/:id/prescriptions` | Get patient's prescription history | Doctor, Admin |
| `GET` | `/patients/:id/invoices` | Get patient's invoice history | Receptionist, Admin |

### Filter Query Parameters for `GET /patients`
```
GET /patients?search=ahmed&gender=male&bloodType=A+&page=1&limit=20
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, phone, national ID, email |
| `gender` | string | Filter by gender (`male`, `female`) |
| `bloodType` | string | Filter by blood type |
| `dateFrom` | date | Registered after date |
| `dateTo` | date | Registered before date |

### Example: POST `/patients`

**Request:**
```json
{
  "nationalId": "1234567890",
  "firstName": "Omar",
  "lastName": "Khalid",
  "firstNameAr": "عمر",
  "lastNameAr": "خالد",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "bloodType": "O+",
  "phone": "+966509876543",
  "email": "omar.khalid@email.com",
  "address": "123 King Fahd Road, Riyadh",
  "emergencyContactName": "Fatima Khalid",
  "emergencyContactPhone": "+966501112233",
  "medicalNotes": "No known chronic conditions",
  "allergies": "Penicillin"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "nationalId": "1234567890",
    "firstName": "Omar",
    "lastName": "Khalid",
    "firstNameAr": "عمر",
    "lastNameAr": "خالد",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "bloodType": "O+",
    "phone": "+966509876543",
    "email": "omar.khalid@email.com",
    "address": "123 King Fahd Road, Riyadh",
    "emergencyContactName": "Fatima Khalid",
    "emergencyContactPhone": "+966501112233",
    "medicalNotes": "No known chronic conditions",
    "allergies": "Penicillin",
    "createdBy": 1,
    "createdAt": "2026-06-09T10:30:00Z",
    "updatedAt": "2026-06-09T10:30:00Z"
  },
  "message": "Patient created successfully"
}
```

---

## 9.4 Appointments Module (`/api/v1/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/appointments` | List appointments with filters | Receptionist, Doctor, Admin |
| `POST` | `/appointments` | Schedule a new appointment | Receptionist, Admin, Patient |
| `GET` | `/appointments/:id` | Get appointment details | Receptionist, Doctor, Admin |
| `PUT` | `/appointments/:id` | Update appointment details | Receptionist, Admin |
| `PATCH` | `/appointments/:id/status` | Update appointment status | Receptionist, Doctor, Admin |
| `DELETE` | `/appointments/:id` | Cancel/delete appointment | Receptionist, Admin |
| `GET` | `/appointments/calendar` | Get calendar view data | Receptionist, Doctor, Admin |
| `GET` | `/appointments/available-slots` | Check doctor availability | Receptionist, Admin, Patient |

### Filter Query Parameters for `GET /appointments`
```
GET /appointments?doctorId=3&status=scheduled&date=2026-06-10&page=1
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctorId` | integer | Filter by doctor |
| `patientId` | integer | Filter by patient |
| `status` | string | Filter by status (`scheduled`, `confirmed`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`) |
| `date` | date | Filter by specific date |
| `dateFrom` | date | Filter from date |
| `dateTo` | date | Filter to date |
| `serviceId` | integer | Filter by service type |

### Example: POST `/appointments`

**Request:**
```json
{
  "patientId": 42,
  "doctorId": 3,
  "serviceId": 1,
  "appointmentDate": "2026-06-15",
  "startTime": "09:00",
  "endTime": "09:30",
  "notes": "Follow-up for blood pressure monitoring"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 150,
    "patient": {
      "id": 42,
      "firstName": "Omar",
      "lastName": "Khalid"
    },
    "doctor": {
      "id": 3,
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "specialization": "Cardiology"
    },
    "service": {
      "id": 1,
      "name": "General Consultation"
    },
    "appointmentDate": "2026-06-15",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "scheduled",
    "notes": "Follow-up for blood pressure monitoring",
    "createdBy": 2,
    "createdAt": "2026-06-09T10:35:00Z"
  },
  "message": "Appointment scheduled successfully"
}
```

### Example: GET `/appointments/available-slots`

**Request:**
```
GET /appointments/available-slots?doctorId=3&date=2026-06-15&serviceId=1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctorId": 3,
    "date": "2026-06-15",
    "serviceDuration": 30,
    "availableSlots": [
      { "startTime": "09:00", "endTime": "09:30" },
      { "startTime": "09:30", "endTime": "10:00" },
      { "startTime": "10:00", "endTime": "10:30" },
      { "startTime": "11:00", "endTime": "11:30" },
      { "startTime": "14:00", "endTime": "14:30" },
      { "startTime": "14:30", "endTime": "15:00" },
      { "startTime": "15:00", "endTime": "15:30" }
    ]
  },
  "message": "Available slots retrieved"
}
```

### Example: GET `/appointments/calendar`

**Request:**
```
GET /appointments/calendar?doctorId=3&month=2026-06&view=week&weekStart=2026-06-15
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "view": "week",
    "startDate": "2026-06-15",
    "endDate": "2026-06-21",
    "appointments": [
      {
        "id": 150,
        "patientName": "Omar Khalid",
        "doctorName": "Dr. Ahmed Hassan",
        "serviceName": "General Consultation",
        "date": "2026-06-15",
        "startTime": "09:00",
        "endTime": "09:30",
        "status": "scheduled",
        "statusColor": "#3498db"
      }
    ]
  }
}
```

---

## 9.5 Visits Module (`/api/v1/visits`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/visits` | List visits with filters | Doctor, Admin |
| `POST` | `/visits` | Create a new visit record | Doctor |
| `GET` | `/visits/:id` | Get visit details (with diagnoses) | Doctor, Admin |
| `PUT` | `/visits/:id` | Update visit record | Doctor |
| `PATCH` | `/visits/:id/status` | Update visit status (in_progress, completed) | Doctor |
| `POST` | `/visits/:id/diagnoses` | Add diagnosis to visit | Doctor |
| `GET` | `/visits/:id/diagnoses` | Get diagnoses for a visit | Doctor, Admin |

### Example: POST `/visits`

**Request:**
```json
{
  "appointmentId": 150,
  "patientId": 42,
  "chiefComplaint": "Patient reports persistent headaches for 2 weeks",
  "vitalSigns": {
    "bloodPressure": "130/85",
    "temperature": 37.2,
    "pulse": 78,
    "respiratoryRate": 16,
    "weight": 82.5,
    "height": 175,
    "oxygenSaturation": 98
  },
  "examinationNotes": "Patient appears alert and oriented. Mild tenderness in temporal region. No neurological deficits observed."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 85,
    "appointmentId": 150,
    "patient": {
      "id": 42,
      "firstName": "Omar",
      "lastName": "Khalid",
      "dateOfBirth": "1990-05-15",
      "bloodType": "O+",
      "allergies": "Penicillin"
    },
    "doctor": {
      "id": 3,
      "firstName": "Ahmed",
      "lastName": "Hassan"
    },
    "checkInTime": "2026-06-15T09:05:00Z",
    "chiefComplaint": "Patient reports persistent headaches for 2 weeks",
    "vitalSigns": {
      "bloodPressure": "130/85",
      "temperature": 37.2,
      "pulse": 78,
      "respiratoryRate": 16,
      "weight": 82.5,
      "height": 175,
      "oxygenSaturation": 98
    },
    "examinationNotes": "Patient appears alert and oriented. Mild tenderness in temporal region. No neurological deficits observed.",
    "status": "in_progress",
    "diagnoses": [],
    "createdAt": "2026-06-15T09:05:00Z"
  },
  "message": "Visit record created successfully"
}
```

### Example: POST `/visits/:id/diagnoses`

**Request:**
```json
{
  "icdCode": "G43.9",
  "diagnosisName": "Migraine, unspecified",
  "diagnosisNameAr": "صداع نصفي، غير محدد",
  "notes": "Tension-type migraine with aura",
  "isPrimary": true
}
```

---

## 9.6 Prescriptions Module (`/api/v1/prescriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/prescriptions` | List prescriptions with filters | Doctor, Admin |
| `POST` | `/prescriptions` | Create a new prescription | Doctor |
| `GET` | `/prescriptions/:id` | Get prescription details with items | Doctor, Receptionist, Admin |
| `PUT` | `/prescriptions/:id` | Update prescription | Doctor |
| `GET` | `/prescriptions/:id/print` | Generate printable PDF | Doctor, Receptionist, Admin |

### Example: POST `/prescriptions`

**Request:**
```json
{
  "visitId": 85,
  "patientId": 42,
  "notes": "Take medications with food. Follow up in 2 weeks.",
  "items": [
    {
      "medicationName": "Sumatriptan",
      "medicationNameAr": "سوماتريبتان",
      "dosage": "50mg",
      "frequency": "As needed, max 2 per day",
      "duration": "30 days",
      "instructions": "Take at onset of migraine symptoms",
      "instructionsAr": "يؤخذ عند بداية أعراض الصداع النصفي",
      "quantity": 10
    },
    {
      "medicationName": "Ibuprofen",
      "medicationNameAr": "ايبوبروفين",
      "dosage": "400mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take after meals",
      "instructionsAr": "يؤخذ بعد الوجبات",
      "quantity": 21
    },
    {
      "medicationName": "Metoclopramide",
      "medicationNameAr": "ميتوكلوبراميد",
      "dosage": "10mg",
      "frequency": "As needed",
      "duration": "14 days",
      "instructions": "Take 30 minutes before meals if nausea occurs",
      "instructionsAr": "يؤخذ قبل الوجبات بنصف ساعة في حالة الغثيان",
      "quantity": 14
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 60,
    "visitId": 85,
    "patient": {
      "id": 42,
      "firstName": "Omar",
      "lastName": "Khalid"
    },
    "doctor": {
      "id": 3,
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "specialization": "Cardiology",
      "licenseNumber": "MD-12345"
    },
    "notes": "Take medications with food. Follow up in 2 weeks.",
    "status": "active",
    "items": [
      {
        "id": 120,
        "medicationName": "Sumatriptan",
        "medicationNameAr": "سوماتريبتان",
        "dosage": "50mg",
        "frequency": "As needed, max 2 per day",
        "duration": "30 days",
        "instructions": "Take at onset of migraine symptoms",
        "instructionsAr": "يؤخذ عند بداية أعراض الصداع النصفي",
        "quantity": 10
      },
      {
        "id": 121,
        "medicationName": "Ibuprofen",
        "medicationNameAr": "ايبوبروفين",
        "dosage": "400mg",
        "frequency": "3 times daily",
        "duration": "7 days",
        "instructions": "Take after meals",
        "instructionsAr": "يؤخذ بعد الوجبات",
        "quantity": 21
      },
      {
        "id": 122,
        "medicationName": "Metoclopramide",
        "medicationNameAr": "ميتوكلوبراميد",
        "dosage": "10mg",
        "frequency": "As needed",
        "duration": "14 days",
        "instructions": "Take 30 minutes before meals if nausea occurs",
        "instructionsAr": "يؤخذ قبل الوجبات بنصف ساعة في حالة الغثيان",
        "quantity": 14
      }
    ],
    "createdAt": "2026-06-15T09:30:00Z"
  },
  "message": "Prescription created successfully"
}
```

---

## 9.7 Billing Module (`/api/v1/billing`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/billing/invoices` | List invoices with filters | Receptionist, Admin |
| `POST` | `/billing/invoices` | Create a new invoice | Receptionist, Admin |
| `GET` | `/billing/invoices/:id` | Get invoice details | Receptionist, Admin |
| `PUT` | `/billing/invoices/:id` | Update invoice | Receptionist, Admin |
| `PATCH` | `/billing/invoices/:id/status` | Update invoice status | Receptionist, Admin |
| `POST` | `/billing/invoices/:id/payments` | Record a payment for invoice | Receptionist, Admin |
| `GET` | `/billing/invoices/:id/payments` | Get payments for an invoice | Receptionist, Admin |
| `GET` | `/billing/invoices/:id/print` | Generate printable invoice PDF | Receptionist, Admin |

### Filter Query Parameters for `GET /billing/invoices`
```
GET /billing/invoices?status=issued&patientId=42&dateFrom=2026-06-01&dateTo=2026-06-30
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `draft`, `issued`, `paid`, `partially_paid`, `cancelled` |
| `patientId` | integer | Filter by patient |
| `dateFrom` | date | Invoice created after |
| `dateTo` | date | Invoice created before |

### Example: POST `/billing/invoices`

**Request:**
```json
{
  "patientId": 42,
  "visitId": 85,
  "dueDate": "2026-07-15",
  "notes": "Consultation and medication",
  "items": [
    {
      "description": "General Consultation",
      "descriptionAr": "استشارة عامة",
      "quantity": 1,
      "unitPrice": 200.00
    },
    {
      "description": "ECG Test",
      "descriptionAr": "فحص تخطيط القلب",
      "quantity": 1,
      "unitPrice": 150.00
    },
    {
      "description": "Blood Pressure Monitoring",
      "descriptionAr": "مراقبة ضغط الدم",
      "quantity": 1,
      "unitPrice": 50.00
    }
  ],
  "discountAmount": 40.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 200,
    "invoiceNumber": "INV-2026-0200",
    "patient": {
      "id": 42,
      "firstName": "Omar",
      "lastName": "Khalid"
    },
    "visitId": 85,
    "items": [
      {
        "id": 301,
        "description": "General Consultation",
        "descriptionAr": "استشارة عامة",
        "quantity": 1,
        "unitPrice": 200.00,
        "totalPrice": 200.00
      },
      {
        "id": 302,
        "description": "ECG Test",
        "descriptionAr": "فحص تخطيط القلب",
        "quantity": 1,
        "unitPrice": 150.00,
        "totalPrice": 150.00
      },
      {
        "id": 303,
        "description": "Blood Pressure Monitoring",
        "descriptionAr": "مراقبة ضغط الدم",
        "quantity": 1,
        "unitPrice": 50.00,
        "totalPrice": 50.00
      }
    ],
    "subtotal": 400.00,
    "taxAmount": 60.00,
    "discountAmount": 40.00,
    "totalAmount": 420.00,
    "status": "draft",
    "dueDate": "2026-07-15",
    "notes": "Consultation and medication",
    "payments": [],
    "createdBy": 2,
    "createdAt": "2026-06-15T10:00:00Z"
  },
  "message": "Invoice created successfully"
}
```

### Example: POST `/billing/invoices/:id/payments`

**Request:**
```json
{
  "amount": 420.00,
  "paymentMethod": "cash",
  "referenceNumber": null,
  "notes": "Full payment received"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 95,
    "invoiceId": 200,
    "amount": 420.00,
    "paymentMethod": "cash",
    "referenceNumber": null,
    "paymentDate": "2026-06-15T10:05:00Z",
    "receivedBy": {
      "id": 2,
      "firstName": "Nour",
      "lastName": "Ali"
    },
    "notes": "Full payment received",
    "createdAt": "2026-06-15T10:05:00Z"
  },
  "message": "Payment recorded successfully"
}
```

---

## 9.8 Reports Module (`/api/v1/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/reports/dashboard` | Role-specific dashboard statistics | Any authenticated |
| `GET` | `/reports/revenue` | Revenue reports with date range | Admin |
| `GET` | `/reports/appointments` | Appointment analytics | Admin, Receptionist |
| `GET` | `/reports/patients` | Patient statistics | Admin |
| `POST` | `/reports/medical-reports` | Upload a medical report file | Doctor |
| `GET` | `/reports/medical-reports/:id` | Download/view medical report | Doctor, Admin |

### Example: GET `/reports/dashboard`

**Request (as Admin):**
```
GET /reports/dashboard
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "stats": {
      "totalPatients": 1250,
      "newPatientsThisMonth": 45,
      "appointmentsToday": 28,
      "appointmentsThisWeek": 142,
      "completedVisitsToday": 15,
      "pendingInvoices": 12,
      "revenueToday": 8500.00,
      "revenueThisMonth": 185000.00
    },
    "recentAppointments": [
      {
        "id": 150,
        "patientName": "Omar Khalid",
        "doctorName": "Dr. Ahmed Hassan",
        "time": "09:00",
        "status": "scheduled",
        "service": "General Consultation"
      }
    ],
    "todaySchedule": [
      {
        "doctorId": 3,
        "doctorName": "Dr. Ahmed Hassan",
        "totalSlots": 16,
        "bookedSlots": 12,
        "completedSlots": 8
      }
    ],
    "revenueChart": {
      "labels": ["Jun 1", "Jun 2", "Jun 3", "Jun 4", "Jun 5"],
      "data": [6500, 7200, 8100, 5900, 8500]
    }
  }
}
```

### Example: GET `/reports/revenue`

**Request:**
```
GET /reports/revenue?dateFrom=2026-06-01&dateTo=2026-06-30&groupBy=week
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dateRange": {
      "from": "2026-06-01",
      "to": "2026-06-30"
    },
    "summary": {
      "totalRevenue": 185000.00,
      "totalInvoices": 320,
      "paidInvoices": 285,
      "pendingAmount": 42000.00,
      "averageInvoice": 578.13
    },
    "byWeek": [
      { "week": "2026-W23", "revenue": 42000, "invoiceCount": 72 },
      { "week": "2026-W24", "revenue": 48000, "invoiceCount": 85 },
      { "week": "2026-W25", "revenue": 51000, "invoiceCount": 88 },
      { "week": "2026-W26", "revenue": 44000, "invoiceCount": 75 }
    ],
    "byPaymentMethod": {
      "cash": 120000.00,
      "card": 45000.00,
      "insurance": 20000.00
    }
  }
}
```

---

## 9.9 Admin Module (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/users` | List all users with pagination | Admin |
| `POST` | `/admin/users` | Create a new user (staff member) | Admin |
| `PUT` | `/admin/users/:id` | Update user details | Admin |
| `DELETE` | `/admin/users/:id` | Deactivate user account | Admin |
| `GET` | `/admin/roles` | List all roles | Admin |
| `POST` | `/admin/roles` | Create a new role | Admin |
| `PUT` | `/admin/roles/:id` | Update role permissions | Admin |
| `GET` | `/admin/services` | List clinic services | Admin |
| `POST` | `/admin/services` | Create a new service | Admin |
| `PUT` | `/admin/services/:id` | Update service details | Admin |
| `DELETE` | `/admin/services/:id` | Deactivate a service | Admin |
| `GET` | `/admin/settings` | Get clinic settings | Admin |
| `PUT` | `/admin/settings` | Update clinic settings | Admin |
| `GET` | `/admin/audit-logs` | View audit logs with filters | Admin |

### Filter Query Parameters for `GET /admin/audit-logs`
```
GET /admin/audit-logs?userId=3&action=UPDATE&entityType=patient&dateFrom=2026-06-01
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | integer | Filter by acting user |
| `action` | string | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `entityType` | string | `patient`, `appointment`, `visit`, `invoice`, etc. |
| `dateFrom` | date | From date |
| `dateTo` | date | To date |

---

## 9.10 Doctors Module (`/api/v1/doctors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/doctors` | List all doctors | Any authenticated |
| `GET` | `/doctors/:id` | Get doctor details and profile | Any authenticated |
| `PUT` | `/doctors/:id` | Update doctor profile | Doctor (own), Admin |
| `GET` | `/doctors/:id/schedule` | Get doctor's schedule | Receptionist, Doctor, Admin |
| `PATCH` | `/doctors/:id/availability` | Toggle doctor availability | Doctor (own), Admin |

---

## 9.11 Notifications Module (`/api/v1/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/notifications` | List user's notifications | Any authenticated |
| `PATCH` | `/notifications/:id/read` | Mark notification as read | Any authenticated (own) |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read | Any authenticated |
| `DELETE` | `/notifications/:id` | Delete a notification | Any authenticated (own) |
| `GET` | `/notifications/unread-count` | Get unread notification count | Any authenticated |

### Example: GET `/notifications`

**Request:**
```
GET /notifications?isRead=false&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 501,
      "title": "New Appointment",
      "titleAr": "موعد جديد",
      "message": "You have a new appointment with Omar Khalid on Jun 15 at 09:00",
      "messageAr": "لديك موعد جديد مع عمر خالد في 15 يونيو الساعة 09:00",
      "type": "appointment",
      "isRead": false,
      "relatedEntityType": "appointment",
      "relatedEntityId": 150,
      "createdAt": "2026-06-09T10:35:00Z"
    },
    {
      "id": 500,
      "title": "Payment Received",
      "titleAr": "تم استلام الدفعة",
      "message": "Payment of SAR 420.00 received for Invoice INV-2026-0200",
      "messageAr": "تم استلام مبلغ 420.00 ريال للفاتورة INV-2026-0200",
      "type": "billing",
      "isRead": false,
      "relatedEntityType": "invoice",
      "relatedEntityId": 200,
      "createdAt": "2026-06-09T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## 9.12 API Summary

| Module | Endpoints | Priority |
|--------|-----------|----------|
| Auth | 8 | Must Have |
| Patients | 9 | Must Have |
| Appointments | 8 | Must Have |
| Visits | 7 | Must Have |
| Prescriptions | 5 | Must Have |
| Billing | 8 | Must Have |
| Reports | 6 | Should Have |
| Admin | 14 | Must Have (subset) |
| Doctors | 5 | Must Have |
| Notifications | 5 | Should Have |
| **Total** | **75** | |

### Role-Based Access Summary

| Endpoint Group | Guest | Patient | Receptionist | Doctor | Admin |
|---------------|-------|---------|--------------|--------|-------|
| Auth (login/register) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auth (profile) | — | ✅ | ✅ | ✅ | ✅ |
| Patients | — | 🔒 Own | ✅ | ✅ Read | ✅ |
| Appointments | — | 🔒 Own | ✅ | ✅ Own | ✅ |
| Visits | — | 🔒 Own | — | ✅ | ✅ |
| Prescriptions | — | 🔒 Own | ✅ Read | ✅ | ✅ |
| Billing | — | 🔒 Own | ✅ | — | ✅ |
| Reports | — | — | ✅ Partial | ✅ Partial | ✅ |
| Admin | — | — | — | — | ✅ |
| Doctors | — | ✅ Read | ✅ Read | ✅ | ✅ |
| Notifications | — | ✅ Own | ✅ Own | ✅ Own | ✅ Own |

> **Legend:** ✅ = Full Access | 🔒 Own = Own records only | ✅ Read = Read-only | ✅ Partial = Limited endpoints | — = No access
