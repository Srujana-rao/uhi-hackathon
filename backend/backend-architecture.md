

# FINAL BACKEND ARCHITECTURE DOCUMENT

*(Your master backend reference — fully generated from backend_structure.txt)*

---

# UHI HEALTH PLATFORM — BACKEND ARCHITECTURE & API GUIDE

**Version: Stable (Finalized)**
**Audience:** Frontend developers, new backend contributors, AI agents working with project context
**Source of truth:** backend_structure.txt

---

# 1. SYSTEM OVERVIEW

The backend is a **Node.js + Express + MongoDB (Mongoose)** application implementing:

* Authentication (JWT)
* Role-based access control (Admin / Doctor / Patient / Staff)
* Unified domain design:

  * Users table (login + role-binding)
  * Doctor, Patient, Staff domain tables
  * Consultations & Prescriptions
  * LHP (Longitudinal Health Profile)
  * Notifications

All backend endpoints live under:

```
http://localhost:4000/api/
```

JWT must be supplied in:

```
Authorization: Bearer <token>
```

---

# 2. ROUTING ARCHITECTURE

Located in: **src/routes/index.js**

All Express routers from `/modules/*` are automatically mounted:

| Module        | Mounted at           | Folder                |
| ------------- | -------------------- | --------------------- |
| Auth          | `/api/auth`          | modules/auth          |
| Users         | `/api/users`         | modules/users         |
| Patients      | `/api/patients`      | modules/patients      |
| Doctors       | `/api/doctors`       | modules/doctors       |
| Staff         | `/api/staff`         | modules/staff         |
| Consultations | `/api/consultations` | modules/consultations |
| Prescriptions | `/api/prescriptions` | modules/prescriptions |
| LHP           | `/api/lhp`           | modules/lhp           |
| Timeline      | `/api/timeline`      | modules/timeline      |
| Notifications | `/api/notifications` | modules/notifications |

The backend prints mounted routes at startup:

```
routes: mounted /auth
routes: mounted /users
...
```

This confirms router integrity.

---

# 3. MODELS (MONGOOSE)

## 3.1 USER MODEL

Located: **src/db/models/User.js**

```js
email: String, required, unique
passwordHash: String, required
role: 'admin' | 'doctor' | 'patient' | 'staff'
name: String

doctorId: ObjectId? (ref: Doctor)
patientId: ObjectId? (ref: Patient)
staffId: ObjectId? (ref: Staff)
```

👉 A **User** is the login identity and links to exactly **one** domain profile.

---

## 3.2 DOCTOR MODEL

Source: Doctor.js

```js
name: String, required
specialization: String
registrationNumber: String
```

## 3.3 PATIENT MODEL

Source: Patient.js

```js
patientCode: String (unique)
name: String
age: Number
gender: String
phone: String
```

## 3.4 STAFF MODEL

```js
name: String
roleDescription: String
```

## 3.5 CONSULTATION + PRESCRIPTION

Contain event-history + SOAP + medication structures used in timeline and LHP.

---

# 4. AUTHENTICATION

## 4.1 Login

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
  token: "<jwt>",
  role: "admin",
  userId: "..."
}
```

## 4.2 JWT Payload

From backend:

```
{
  sub: <userId>,
  role: "admin" | "doctor" | "patient" | "staff",
  name,
  doctorId?,
  patientId?,
  staffId?
}
```

Extracted by middleware:

```
req.user = {
  sub,
  role,
  name,
  doctorId,
  patientId,
  staffId
};
```

---

# 5. ROLE-BASED ACCESS CONTROL

## 5.1 Admin-only capabilities

* Create user accounts (doctor/patient/staff)
* List all users
* Delete any user
* Update any user

## 5.2 Doctor permissions

* Can access **own consults**
* Can access **patients linked to consultations**
* Can access LHP **only during active relationship**

## 5.3 Patient permissions

* Can view **own profile**
* Can view **timeline + prescriptions + consultations**

## 5.4 Staff permissions

* Can view minimal patient info if needed
* Cannot view confidential LHP without escalation

Everything is enforced in controllers via:

```
req.user.role
req.user.sub
req.user.patientId
req.user.doctorId
```

---

# 6. SINGLE-STEP USER CREATION (IMPORTANT)

This is the most important functionality in the backend.

Admin sends **1 request**:

```
POST /api/users
```

Example (doctor):

```json
{
  "email": "doctor5@test.com",
  "password": "password123",
  "name": "Dr Neo",
  "role": "doctor",
  "doctor": {
    "name": "Dr Neo",
    "specialization": "Neurology",
    "registrationNumber": "REG-5005"
  }
}
```

### Backend automatically does:

1. Creates Doctor record
2. Creates User with doctorId linking to Doctor document
3. Returns final merged output

🔒 Prevents creating admin unless:

```
ALLOW_ADMIN_CREATE=true
```

---

# 7. USERS MODULE — FINAL LOGIC

## 7.1 users.service.js

Contains:

* Automatic domain creation
* Transactions
* Admin restrictions

Structure:

```js
if role == doctor → create Doctor
if role == patient → create Patient
if role == staff → create Staff
create User with foreign keys
```

Also filters:

* Cannot create admin unless env allows
* Cannot modify user.role → admin unless env allows
* Always returns user without passwordHash

---

## 7.2 users.controller.js

Enforces API-level permissions:

### Admin-only:

```
GET /api/users
GET /api/users/:id
POST /api/users
DELETE /api/users/:id
```

### Self-access allowed:

```
PUT /api/users/:id → if requester is same user
```

### Redaction logic:

When non-admin fetches a user:

* Doctor sees patient **basic clinical essentials** (name, age, gender, phone)
* Staff sees minimal data
* Patient sees ONLY themselves

---

# 8. LHP ACCESS CONTROL

Located: `modules/lhp/lhp.controller.js`

Doctor can access patient LHP **only if a ConsultationEvent exists connecting them**:

```
findOne({ doctorId: req.user.doctorId, patientId: req.params.patientId })
```

If not found:

```
403 Forbidden — Doctor cannot access this LHP
```

Patients can always access their own LHP.

Admins can access any LHP.

---

# 9. TESTING WITH CURL (FULL SUITE)

## 9.1 Login tests

### Admin login

```
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq
```

### Doctor login

```
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor1@test.com","password":"password123"}'
```

### Patient login

```
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@test.com","password":"password123"}'
```

---

## 9.2 Create a doctor (admin only)

```
TOKEN=<admin_jwt>

curl -i -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "email":"d9@test.com",
        "password":"p123",
        "name":"Dr Nine",
        "role":"doctor",
        "doctor": { "name":"Dr Nine","specialization":"Ortho" }
      }'
```

---

## 9.3 Test restricted access

### Patients cannot list users

```
curl -i -H "Authorization: Bearer $PATIENT_TOKEN" http://localhost:4000/api/users
→ 403 Forbidden
```

### Doctors cannot fetch random patients

```
curl -i -H "Authorization: Bearer $DOC_TOKEN" http://localhost:4000/api/users/<other-patient-id>
→ 403 Forbidden
```

### Patients cannot fetch others

```
curl -i -H "Authorization: Bearer $PAT_TOKEN" \
     http://localhost:4000/api/users/<other-patient-id>
→ 403 Forbidden
```

---

# 10. SEED SYSTEM

The seeder:

* Handles ObjectId conversion
* Hashes passwordHash automatically
* Inserts sample Doctors, Patients, Staff, Users, Consultations, Prescriptions

---

# 11. BACKEND STARTUP

```
npm run dev
```

Output:

```
routes: mounted /auth
routes: mounted /users
...
MongoDB connected
Backend running on http://localhost:4000
```

---

# 12. WHAT FRONTEND MUST KNOW (REQUIRED)

### Login returns JWT + role

Store securely.

### Every authenticated request MUST send:

```
Authorization: Bearer <token>
```

### User creation always done through:

```
POST /api/users
```

### Doctors & Patients are not created directly — always through user creation.

### Role-based UI must respect backend rules.

---

# 13. BACKEND IS **FINAL & STABLE**

This document reflects:

* Actual source code
* Actual routing
* Actual access control
* Final one-step user creation flow
* Working tested endpoints

This can now be committed into:

```
/backend/docs/backend-architecture.md
```

---

