# **UHI Health Platform — Full Stack Application**

A modern digital health platform built with:

* **Backend:** Node.js, Express, MongoDB, Mongoose
* **Frontend:** React + Vite
* **AI Services:** Integrated mock & live models
* **Authentication:** JWT-based role access
* **Domain Entities:** Doctor, Patient, Staff, Consultations, Prescriptions, LHP

This README provides everything needed to **understand, run, and extend the project**.

---

# 🚀 **1. Features Overview**

### **Core Functionalities**

* Secure JWT authentication
* Role-based access

  * Admin
  * Doctor
  * Patient
  * Staff
* Admin can create new users in a **single-step**:
  → User + Doctor/Patient/Staff profile auto-linked
* Longitudinal Health Profile (LHP)
* Consultations & Prescriptions API
* AI-powered medical suggestion modules (mock/live)

---

# 🧱 **2. Project Structure**

```
/backend
    /src
        app.js
        server.js
        /routes
        /modules
            /auth
            /users
            /patients
            /doctors
            /staff
            /consultations
            /prescriptions
            /lhp
            /timeline
            /notifications
        /middleware
        /db
            /models
            /seed
/frontend
    (Vite + React project)
```

---

# 🔧 **3. Backend Setup**

## **3.1 Environment Variables**

Create `/backend/.env`:

```
PORT=4000
MONGO_URI=mongodb+srv://<cluster>
JWT_SECRET=<your-secret>
NODE_ENV=development
AI_MODE=mock
OPENAI_API_KEY=<optional>
ADMIN_API_KEY=<admin-master-key>
FRONTEND_URL=http://localhost:5173

# IMPORTANT — prevents accidental extra admin creation
ALLOW_ADMIN_CREATE=false
```

---

## **3.2 Install & Run Backend**

```
cd backend
npm install
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

---

# 🔐 **4. Authentication**

## **4.1 Login**

```
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

Response:

```
{
  "token": "<JWT>",
  "role": "admin",
  "userId": "..."
}
```

---

# 👤 **5. User Management (Admin Only)**

## **5.1 Create User — Single Step**

### Example → Create Doctor

```
POST /api/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "email": "doctor4@test.com",
  "password": "password123",
  "name": "Dr Strange",
  "role": "doctor",
  "doctor": {
    "name": "Dr Strange",
    "specialization": "Neurology",
    "registrationNumber": "REG-1001"
  }
}
```

Backend automatically:

* Creates the **Doctor** record
* Creates the **User** record
* Links using `doctorId`

### Example Response

```
{
  "email": "doctor4@test.com",
  "role": "doctor",
  "doctorId": "...",
  "name": "Dr Strange",
  "_id": "...",
  "createdAt": "...",
}
```

---

# 📚 **6. Role-Based Access Rules**

| Role        | Permissions                                                |
| ----------- | ---------------------------------------------------------- |
| **Admin**   | Full access; user creation; list all users                 |
| **Doctor**  | View own profile, view patient demographics during consult |
| **Patient** | View own LHP, consultations, prescriptions                 |
| **Staff**   | Basic access; cannot see PHI                               |
| **System**  | AI-service integrations                                    |

Backend strictly prevents:

* Creating new admin accounts (unless env allows)
* Patients/staff accessing user list
* Doctors accessing unrelated patients
* Anyone reading passwordHash fields

---

# 🩺 **7. LHP — Longitudinal Health Profile**

Endpoints:

```
GET /api/lhp/:patientId
```

Access rules:

* Patient can view own LHP
* Doctor can view LHP **ONLY if** involved in an active consultation
* Admin can view all (for debugging)

---

# 🧾 **8. Consultations & Prescriptions**

```
GET /api/consultations
GET /api/consultations/:id

GET /api/prescriptions
GET /api/prescriptions/:id
```

Used mainly in:

* Doctor dashboard
* Patient dashboard timeline
* LHP profile building

---

# 🔗 **9. Frontend Setup**

```
cd frontend
npm install
npm run dev
```

Configure environment:

`frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

---

# 🧪 **10. Testing the Backend (cURL)**

## 10.1 Login as Patient

```
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@test.com","password":"password123"}'
```

## 10.2 Patient — view own profile

```
curl -H "Authorization: Bearer <PATIENT_TOKEN>" \
 http://localhost:4000/api/users/<own-user-id>
```

## 10.3 Admin — list users

```
curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
 http://localhost:4000/api/users
```

---

# 🛠 **11. Development Commands**

### Seed database:

```
cd backend/src/db/seed
node seed.js
```

---

# 📦 **12. Deployment Notes**

* Use environment variables
* Ensure Mongo replica set enabled for transactions (optional)
* Use reverse proxy for SSL (Nginx recommended)
* JWT secret must be rotated periodically

---

# 🤝 **13. Contributing**

See `CONTRIBUTING.md` (coming next).

---

# 📘 **14. License**

Private project — not licensed for public distribution.

---

# 🎉 End of README
