# 🧾 **UHI Hackathon – Backend API Notes for Frontend Team**

### *(Consultations + Prescriptions + Auth + Roles)*

---

# 1️⃣ Authentication — Login Flow

### **POST `/api/auth/login`**

#### Request:

```json
{
  "email": "doctor1@test.com",
  "password": "password123"
}
```

#### Response:

```json
{
  "token": "<JWT>",
  "role": "doctor",
  "userId": "<mongo_user_id>"
}
```

### JWT Includes:

```json
{
  "sub": "<userId>",
  "role": "doctor",
  "doctorId": "<doctorCollectionId>",
  "email": "doctor1@test.com",
  "iat": 0,
  "exp": 0
}
```

### FRONTEND MUST attach token:

```
Authorization: Bearer <token>
```

---

# 2️⃣ Consultations Module

## 🔒 Role Permission Summary

| Role        | Can Do What?                                                        |
| ----------- | ------------------------------------------------------------------- |
| **doctor**  | View only OWN consultations; verify SOAP only for OWN consultations |
| **patient** | View only their own consultations                                   |
| **staff**   | Cannot view consultations by default                                |
| **admin**   | Full access                                                         |

---

## 2.1 ➤ Create Consultation

### **POST `/api/consultations`**

#### Payload:

```json
{
  "patientId": "<patientId>",
  "doctorId": "<doctorId>"
}
```

Backend auto-adds:

```json
createdByRole
createdByUserId
status: "UNVERIFIED"
```

📌 **Frontend should call this when recording STARTS.**

---

## 2.2 ➤ List Consultations

### **GET `/api/consultations`**

Auto-filtering:

| Role    | Returned Rows                                |
| ------- | -------------------------------------------- |
| doctor  | only doctorId = JWT.doctorId                 |
| patient | only patientId = JWT.patientId               |
| staff   | empty (unless admin filter manually applied) |
| admin   | full list                                    |

Admin can filter:

```
/api/consultations?doctorId=<id>
/api/consultations?patientId=<id>
```

---

## 2.3 ➤ Get Consultation by ID

### **GET `/api/consultations/:id`**

Access rules enforced by backend.

---

## 2.4 ➤ Verify SOAP (Doctor Only)

### **PUT `/api/consultations/:id/verify`**

#### Payload:

```json
{
  "soap": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  }
}
```

Backend does:

✔ Moves previous SOAP to `history`
✔ Updates `soap.current`
✔ Marks as `VERIFIED_DOCTOR`

---

# 3️⃣ Prescription Module

🚨 **Important — This module now works perfectly after fixes.**

## 🔒 Role Permission Summary (After Fix)

| Role             | Allowed to Verify? | Condition                                      |
| ---------------- | ------------------ | ---------------------------------------------- |
| **doctor**       | ✔ YES              | Only if doctorId matches prescription.doctorId |
| **staff**        | ✔ YES              | Anyone in staff can verify (dispense)          |
| **admin**        | ✔ YES              | Allowed                                        |
| **other doctor** | ❌ NO               | Forbidden                                      |
| **patient**      | ❌ NO               | Forbidden                                      |

---

## 3.1 ➤ Create Prescription

### **POST `/api/prescriptions`**

Currently supports direct JSON create.

Example:

```json
{
  "patientId": "<id>",
  "doctorId": "<id>",
  "linkedConsultationId": "<id>",
  "imagePath": "/uploads/images/presc.png"
}
```

Backend adds:

```json
createdByRole
createdByUserId
status: "UNVERIFIED"
```

---

## 3.2 ➤ List Prescriptions

### **GET `/api/prescriptions`**

Role filtering:

| Role    | What they see            |
| ------- | ------------------------ |
| doctor  | only their prescriptions |
| patient | only their prescriptions |
| staff   | all (if configured)      |
| admin   | full list                |

---

## 3.3 ➤ Get Prescription by ID

### **GET `/api/prescriptions/:id`**

Checks:

* doctor → ONLY if matches prescription.doctorId
* patient → ONLY if matches prescription.patientId
* staff/admin → allowed

---

## 3.4 ➤ Verify Prescription

### **PATCH `/api/prescriptions/:id/verify`**

### If doctor verifies:

```json
{
  "status": "VERIFIED_DOCTOR",
  "verifiedBy": "<userId>",
  "verifiedAt": "<timestamp>"
}
```

### If staff verifies:

```json
{
  "status": "VERIFIED_STAFF",
  "dispensedByStaffId": "<staffUserId>",
  "dispensedAt": "<timestamp>"
}
```

### If admin verifies:

```json
{
  "status": "VERIFIED_ADMIN"
}
```

---

# 4️⃣ JWT Fields Frontend MUST Use

| Key              | Why it matters                                |
| ---------------- | --------------------------------------------- |
| `role`           | Switch UI by user type                        |
| `doctorId`       | Filtering doctor consultations/prescriptions  |
| `patientId`      | Filtering patient consultations/prescriptions |
| `staffId`        | Display dispense/verify options               |
| `sub` / `userId` | Identifying user                              |

---

# 5️⃣ Sample Copy-Paste Commands (For Testing)

## Login

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor1@test.com","password":"password123"}'
```

## Doctor List Consultations

```bash
curl -H "Authorization: Bearer $DOC_TOKEN" http://localhost:4000/api/consultations
```

## Verify SOAP

```bash
curl -X PUT http://localhost:4000/api/consultations/<id>/verify \
  -H "Authorization: Bearer $DOC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "soap": { "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." } }'
```

## Verify Prescription (doctor / staff)

```bash
curl -X PATCH http://localhost:4000/api/prescriptions/<id>/verify \
  -H "Authorization: Bearer $DOC_TOKEN" \
  -H "Content-Type: application/json" -d '{}'
```

---

# 6️⃣ Frontend Dashboard Mapping

## 👨‍⚕️ Doctor Dashboard

✔ Show own consultations
✔ Show own prescriptions
✔ Enable SOAP verify only for UNVERIFIED consultations
✔ Enable prescription verify only for UNVERIFIED prescriptions

## 👩‍⚕️ Staff Dashboard

✔ View prescriptions needing verification
✔ Mark as dispensed

## 🧑‍🦰 Patient Dashboard

✔ Show own consultations (read-only)
✔ Show own prescriptions (read-only)

## 🛠 Admin Dashboard

✔ Full visibility
✔ CRUD allowed for testing
✔ Can verify prescriptions (rare)

---

# 7️⃣ Final Confirmation ✅

✔ Auth flow correct
✔ JWT fields correct
✔ Consultation logic correct
✔ SOAP verification correct
✔ Prescription verification strict & working
✔ All restrictions now enforced
✔ List & Get endpoints working
✔ Role filtering documented

---

