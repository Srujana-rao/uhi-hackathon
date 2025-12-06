# ✅ **Consultation API – Minimal + Correct Flow (as actually implemented)**

This is the **true backend behavior** based on your code:

---

# 1️⃣ **Create Consultation**

### **POST `/api/consultations`**

Use this when a consultation is started (patient/doctor begins recording).

#### Request:

```json
{
  "patientId": "<patientId>",
  "doctorId": "<doctorId>"
}
```

Backend automatically fills:

* `createdByRole`
* `createdByUserId`
* `status: "UNVERIFIED"`
* empty `soap`
* optional later fields: `audioPath`, `transcript`

---

# 2️⃣ **Update Consultation (PATCH) – audio, transcript, AND SOAP allowed**

### **PATCH `/api/consultations/:id`**

➡️ This endpoint is the **general updater**.

It **does NOT verify SOAP**, but **it DOES allow updating soap.current** without adding to history.

### Use cases:

✔ audioPath update
✔ transcript update
✔ first-time soap insertion
✔ soap overwrite (WITHOUT versioning)

### Example:

```bash
curl -X PATCH "http://localhost:4000/api/consultations/<id>" \
  -H "Authorization: Bearer $DOC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audioPath": "/uploads/audio/consult-xyz.mp3",
    "transcript": "final transcript from ASR",
    "soap": {
      "subjective": "Updated S...",
      "objective": "Updated O...",
      "assessment": "Updated A...",
      "plan": "Updated P..."
    }
  }'
```

✔ audio gets stored
✔ transcript gets stored
✔ `soap.current` is replaced
❌ **NOT pushed into history**
❌ **NOT marked VERIFIED_DOCTOR**

This is **expected**.

---

# 3️⃣ **Verify SOAP (DOCTOR ONLY) – versioning + status update**

### **PUT `/api/consultations/:id/verify`**

This is the **ONLY endpoint that performs proper SOAP versioning**.

It will:

✔ Push previous `soap.current` → `soap.history[]`
✔ Create new `soap.current` with metadata
✔ Set `status = "VERIFIED_DOCTOR"`

This is the **official verification flow**.

### Example:

```bash
curl -X PUT "http://localhost:4000/api/consultations/<id>/verify" \
  -H "Authorization: Bearer $DOC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "soap": {
      "subjective": "...",
      "objective": "...",
      "assessment": "...",
      "plan": "..."
    }
  }'
```

---

# 4️⃣ **Correct Behavioral Summary (very important)**

| Action                                | Endpoint      | Updates SOAP? | Adds SOAP History? | Changes Status? |
| ------------------------------------- | ------------- | ------------- | ------------------ | --------------- |
| **Create consultation**               | POST          | ❌             | ❌                  | UNVERIFIED      |
| **Update audio/transcript**           | PATCH         | ✔ optional    | ❌                  | ❌               |
| **Overwrite SOAP (non-verification)** | PATCH         | ✔             | ❌                  | ❌               |
| **Verify SOAP (doctor)**              | PUT `/verify` | ✔             | ✔                  | VERIFIED_DOCTOR |

---

# 5️⃣ Why your SOAP didn't update earlier

Because your PATCH worked fine **except SOAP**, due to:

* You didn’t have a `PATCH /api/consultations/:id` route earlier.
* Now that you added it → **it updates soap.current correctly**.

🎉 Now PATCH + PUT flows both work exactly as intended.

---

# 6️⃣ Minimal Developer Documentation (copy-paste ready)

```
CONSULTATION FLOW

1) CREATE
POST /api/consultations
- creates empty consultation
- sets createdByRole & createdByUserId
- status = UNVERIFIED

2) UPDATE (audio/transcript + overwrite SOAP)
PATCH /api/consultations/:id
Allowed fields:
- audioPath
- transcript
- soap.current (no history push)
This does NOT verify SOAP.

3) VERIFY SOAP (doctor only)
PUT /api/consultations/:id/verify
- pushes old soap.current -> history[]
- sets new soap.current
- sets status = VERIFIED_DOCTOR
- enforces doctorId ownership

```

