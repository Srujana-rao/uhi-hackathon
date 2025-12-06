# ✅ **1. LHP API — Frontend Integration Guide**

A clean document describing **every endpoint**, what each role gets, and sample payloads.

---

# 🩺 **LHP API: Full Frontend Guide**

## **Base Route**

```
/api/lhp
```

---

# -----------------------------------------

# 🔍 **1) Get Patient LHP**

### **GET /api/lhp/:patientId**

Returns the patient's Longitudinal Health Profile.

### **Headers**

```
Authorization: Bearer <JWT>
```

---

## **🔸 ROLE-BASED VISIBILITY**

| Role        | What they see                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin**   | Everything (verified + unverified)                                                                                                        |
| **Patient** | Everything for *their own* record                                                                                                         |
| **Doctor**  | **Only verified entries** (`status: VERIFIED_DOCTOR`), unless… doctor has an *ongoing appointment* with patient (optional future feature) |
| **Staff**   | Only verified entries                                                                                                                     |

---

## **Sample Response**

```json
{
  "success": true,
  "data": {
    "chronic": [ ... ],
    "allergies": [ ... ],
    "currentMedications": [ ... ],
    "pastProcedures": [ ... ]
  }
}
```

Each item includes:

```
_id
patientId
label / substance / name / procedure
notes
status (VERIFIED_DOCTOR | UNVERIFIED)
source { type, eventId }
createdByUserId
createdAt, updatedAt
```

---

# -----------------------------------------

# 📝 **2) List LHP Suggestions for a Doctor**

These are AI-generated suggestions that doctors can ACCEPT or REJECT.

### **GET /api/lhp/suggestions**

Doctor-only.

### **Response**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "patientId": "...",
      "doctorId": "...",
      "section": "CHRONIC_CONDITION | ALLERGY | CURRENT_MED | PAST_PROCEDURE",
      "proposedEntry": {...},
      "status": "PENDING",
      "sourceType": "CONSULTATION",
      "sourceEventId": "..."
    }
  ]
}
```

---

# -----------------------------------------

# ➕ **3) Create a Suggestion (AI or System Only)**

*(Frontend likely will NOT call this unless you manually try.)*

### **POST /api/lhp/suggestions**

Body example:

```json
{
  "patientId": "...",
  "doctorId": "...",
  "section": "CHRONIC_CONDITION",
  "proposedEntry": {
    "label": "Dyslipidemia",
    "notes": "AI detected elevated LDL ...",
    "status": "UNVERIFIED"
  },
  "sourceType": "CONSULTATION",
  "sourceEventId": "123"
}
```

Response:

```json
{ "success": true, "data": { ... } }
```

---

# -----------------------------------------

# ✔️ **4) Accept / Reject Suggestion (Doctor Only)**

### **POST /api/lhp/suggestions/:id/act**

Body:

```json
{ "action": "accept" }
```

or

```json
{ "action": "reject" }
```

---

## **When "accept" happens:**

Backend automatically:

1. Creates a new LHP entry (Chronic, Allergy, Med, Procedure)
2. Marks the suggestion as:

```
status: "ACCEPTED"
actedByDoctorId
actedAt
```

### Response (example when accepting chronic):

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "patientId": "...",
    "label": "Dyslipidemia",
    "notes": "...",
    "status": "VERIFIED_DOCTOR"
  }
}
```

---

# -----------------------------------------

# 📌 **5) LHP Status Rules (Important for Frontend UI)**

### ⭐ Verified entries:

```
status = "VERIFIED_DOCTOR"
```

Visible to:

* All doctors
* Staff
* Patient
* Admin

### ❗ Unverified entries:

```
status = "UNVERIFIED"
```

Visible to:

* The patient themselves
* Admin
* NOT visible to doctors/staff until verified
* Visible to the doctor **during consultation** (future extension)

---

# -----------------------------------------

# 📎 **6) Frontend Usage Summary**

## **To show patient's LHP for a doctor**

```
GET /api/lhp/<patientId>
```

Shows **only verified entries**.

## **To show LHP for a patient**

```
GET /api/lhp/<their own patientId>
```

Shows **everything**.

## **To show suggestions list**

```
GET /api/lhp/suggestions
```

## **To verify/reject**

```
POST /api/lhp/suggestions/:id/act
{ action: "accept" }
```

or

```
{ action: "reject" }
```

---

# ============================================================

# 🧪 **2. HOW TO RUN THE TEST SCRIPTS**

Your test scripts:

```
scripts/test_lhp.sh
scripts/test_lhp_suggestions_verify.sh
scripts/test_role_tokens.sh
```

### **Run all:**

```
./scripts/test_lhp.sh
./scripts/test_lhp_suggestions_verify.sh
./scripts/test_role_tokens.sh
```

### If the shell complains about permission:

```
chmod +x scripts/*.sh
```

---

# ============================================================

# 🔐 **3. How to Use `.tokens.env`**

You already generate a file with tokens:

```
.tokens.env
```

Example content:

```
TOKEN_DOCTOR1=...
TOKEN_DOCTOR2=...
TOKEN_PATIENT1=...
TOKEN_ADMIN=...
TOKEN_STAFF1=...
```

### **Load it into your shell:**

```
source .tokens.env
```

Then you can use:

```
curl -H "Authorization: Bearer $TOKEN_DOCTOR1" ...
```

No more copying tokens manually 🎉

---
