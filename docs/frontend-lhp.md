# LHP (Longitudinal Health Profile) – Frontend Integration Guide

This document explains how frontend should talk to the backend for **LHP**:

- How to **fetch** a patient’s LHP
- How **roles** see different data
- How doctors **review & verify** LHP via suggestions
- API endpoints, payloads, and expected UI behavior

Base URL (dev):

```text
http://localhost:4000/api
````

All endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Tokens come from:

```http
POST /api/auth/login
```

---

## 1. Roles & What They See

### Roles we care about here

* `admin`
* `doctor`
* `patient`
* `staff`

### LHP visibility rules (GET `/api/lhp/:patientId`)

* **Doctor**

  * Can request **any** patient’s LHP.
  * **Only sees entries with `status = "VERIFIED_DOCTOR"`**.
  * This is the “trusted, clinically verified” view.

* **Staff**

  * Same behavior as doctor right now:
  * Sees only `VERIFIED_DOCTOR` entries.

* **Patient**

  * Can request **only their own** LHP (`:patientId` == their `patientId`).
  * Sees **all** entries (verified + unverified).
  * Use badges in UI to show whether something is verified or pending.

* **Admin**

  * Can request **any** patient’s LHP.
  * Sees **all** entries (verified + unverified).

---

## 2. LHP Read API

### 2.1 Endpoint

```http
GET /api/lhp/:patientId
```

#### Headers

```http
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

#### Response (common shape)

```json
{
  "success": true,
  "data": {
    "chronic": [ /* LhpChronicCondition[] */ ],
    "allergies": [ /* LhpAllergy[] */ ],
    "currentMedications": [ /* LhpCurrentMedication[] */ ],
    "pastProcedures": [ /* LhpPastProcedure[] */ ]
  }
}
```

### 2.2 Object shapes

#### `chronic[]` – LhpChronicCondition

```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "label": "Type 2 Diabetes",
  "notes": "Diagnosed 2 years ago. Controlled with Metformin.",
  "status": "VERIFIED_DOCTOR" | "UNVERIFIED",
  "source": {
    "type": "MANUAL" | "CONSULTATION" | "PRESCRIPTION",
    "eventId": "string"
  },
  "createdByUserId": "ObjectId",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### `allergies[]` – LhpAllergy

```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "substance": "Penicillin",
  "reaction": "Rash",
  "severity": "mild" | "moderate" | "severe",
  "status": "VERIFIED_DOCTOR" | "UNVERIFIED",
  "source": { "type": "MANUAL", "eventId": "string" },
  "createdByUserId": "ObjectId",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### `currentMedications[]` – LhpCurrentMedication

```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "BID",
  "route": "oral",
  "startDate": "ISO date",
  "endDate": "ISO date | null",
  "isCurrent": true,
  "status": "VERIFIED_DOCTOR" | "UNVERIFIED",
  "source": { "type": "MANUAL", "eventId": "string" },
  "createdByUserId": "ObjectId",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

#### `pastProcedures[]` – LhpPastProcedure

```json
{
  "_id": "ObjectId",
  "patientId": "ObjectId",
  "procedure": "Appendectomy",
  "date": "ISO date",
  "notes": "No complications.",
  "status": "VERIFIED_DOCTOR" | "UNVERIFIED",
  "source": { "type": "MANUAL", "eventId": "string" },
  "createdByUserId": "ObjectId",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

---

## 3. LHP UI Behavior Per Role

### 3.1 Doctor view (consultation / patient profile)

* Use: `GET /api/lhp/:patientId` with doctor token.
* You will only receive `status = "VERIFIED_DOCTOR"` entries.
* **No need to filter in frontend**; treat everything as "verified".
* Show simple LHP cards:

  * Chronic conditions list
  * Allergies
  * Current medications
  * Past procedures

### 3.2 Patient view (their own LHP page)

* Use: `GET /api/lhp/:patientId` where `:patientId` is their own.

* You may see both:

  ```text
  status: "VERIFIED_DOCTOR"
  status: "UNVERIFIED"
  ```

* Recommended UX:

  * Show a **badge** for each entry:

    * `VERIFIED_DOCTOR` → “Verified by doctor”
    * `UNVERIFIED` → “Pending verification”
  * Optionally show “Source: from consultation X / prescription Y” using `source`.

### 3.3 Admin view

* Same endpoint, admin token.
* Can see everything for any patient.
* Useful for demo / debugging.

---

## 4. LHP Suggestions (for Doctors)

**LHP suggestions** are the way AI / system proposes changes to LHP, and doctors verify them.

### 4.1 List suggestions for logged-in doctor

```http
GET /api/lhp/suggestions/list
```

#### Auth

* **Only `role = "doctor"`** can call this.
* Backend filters by `doctorId` and `status = "PENDING"`.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "SuggestionId",
      "patientId": "ObjectId",
      "doctorId": "ObjectId",
      "section": "CHRONIC_CONDITION" | "ALLERGY" | "CURRENT_MED" | "PAST_PROCEDURE",
      "proposedEntry": {
        // shape depends on section
      },
      "status": "PENDING",
      "sourceType": "CONSULTATION" | "PRESCRIPTION" | "MANUAL",
      "sourceEventId": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

#### `proposedEntry` shapes

* If `section = "CHRONIC_CONDITION"`:

  ```json
  {
    "label": "Dyslipidemia",
    "notes": "AI detected elevated LDL mentioned in SOAP."
  }
  ```

* If `section = "ALLERGY"`:

  ```json
  {
    "substance": "NSAIDs",
    "reaction": "Gastric irritation",
    "severity": "mild"
  }
  ```

* If `section = "CURRENT_MED"`:

  ```json
  {
    "name": "Atorvastatin",
    "dosage": "10mg",
    "frequency": "OD",
    "route": "oral",
    "startDate": "2025-02-01T00:00:00.000Z",
    "endDate": null,
    "isCurrent": true
  }
  ```

* If `section = "PAST_PROCEDURE"`:

  ```json
  {
    "procedure": "C-section",
    "date": "2019-03-10T00:00:00.000Z",
    "notes": "Elective; post-op stable."
  }
  ```

### 4.2 Acting on a suggestion (doctor accept/reject)

```http
POST /api/lhp/suggestions/:id/action
```

#### Body

```json
{
  "action": "accept" | "reject"
}
```

#### Rules (IMPORTANT)

* Only `role = "doctor"` can call this.
* The suggestion **must belong to this doctor** (`suggestion.doctorId === req.user.doctorId`), otherwise:

  * `403 Forbidden: suggestion is not assigned to this doctor`
* Suggestion must be `status = "PENDING"`:

  * Otherwise: `400 "Suggestion is not in PENDING state"`

#### On `action = "reject"`

* Suggestion status becomes `REJECTED`.
* No change to LHP collections.
* Response:

```json
{
  "success": true,
  "data": {
    "_id": "SuggestionId",
    "status": "REJECTED",
    "actedByDoctorId": "UserId",
    "actedAt": "ISO date",
    ...
  }
}
```

#### On `action = "accept"`

* Backend:

  * Creates a new LHP entry in the right collection:

    * If section = `CHRONIC_CONDITION` → `LhpChronicCondition`
    * If section = `ALLERGY` → `LhpAllergy`
    * If section = `CURRENT_MED` → `LhpCurrentMedication`
    * If section = `PAST_PROCEDURE` → `LhpPastProcedure`
  * **Sets `status = "VERIFIED_DOCTOR"`** for that new entry.
  * Marks suggestion as `ACCEPTED`.

* Response (returns the NEW LHP entry):

```json
{
  "success": true,
  "data": {
    "_id": "NewLhpEntryId",
    "patientId": "ObjectId",
    // plus fields from that section
    "status": "VERIFIED_DOCTOR",
    "source": {
      "type": "CONSULTATION",         // from suggestion.sourceType
      "eventId": "000000000000000000000101"
    },
    "createdByUserId": "UserId",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

* After this:

  * `GET /api/lhp/:patientId` (as doctor) will now show this entry (since it’s VERIFIED_DOCTOR).
  * `GET /api/lhp/suggestions/list` (as same doctor) will **no longer** show this suggestion (it’s no longer `PENDING`).

---

## 5. Suggested Frontend UX

### 5.1 Doctor – “LHP Overview” panel

* On patient consultation or doctor’s patient details screen:

  * Call: `GET /api/lhp/:patientId` with doctor token.
  * Render 4 cards / sections:

    * Chronic Conditions
    * Allergies
    * Current Medications
    * Past Procedures
  * No extra filtering needed; everything returned is verified.

### 5.2 Doctor – “LHP Suggestions” panel

* Panel/tab like: **“LHP Suggestions (AI)”**
* On load:

  * `GET /api/lhp/suggestions/list` (doctor token)
* For each suggestion:

  * Show:

    * Section (Chronic/Allergy/Med/Procedure)
    * Patient identifier / name (if available in UI state)
    * `proposedEntry` fields nicely formatted.
    * Source info like: “From consultation #X” using `sourceType` + `sourceEventId`.
  * Two buttons:

    * **Accept** → `POST /api/lhp/suggestions/:id/action` `{ "action": "accept" }`
    * **Reject** → `POST /api/lhp/suggestions/:id/action` `{ "action": "reject" }`
  * After a successful action:

    * Locally remove that suggestion from the list.
    * Optionally re-fetch LHP to show updated info.

### 5.3 Patient – “My LHP” page

* Call: `GET /api/lhp/:patientId` with patient token.
* For each entry, show:

  * Label / name / procedure details.
  * Badge:

    * Verified: `status === "VERIFIED_DOCTOR"`
    * Pending: `status === "UNVERIFIED"`
* This gives a **transparent** view of what is still under review.

---

## 6. Quick Example: React hook for LHP

Very rough example for doctor/patient:

```js
// src/api/lhpApi.js
import { httpClient } from './httpClient';

export async function fetchLhp(patientId) {
  const res = await httpClient.get(`/lhp/${patientId}`);
  return res.data.data; // { chronic, allergies, currentMedications, pastProcedures }
}

export async function fetchLhpSuggestions() {
  const res = await httpClient.get('/lhp/suggestions/list');
  return res.data.data; // suggestion[]
}

export async function actOnLhpSuggestion(id, action) {
  const res = await httpClient.post(`/lhp/suggestions/${id}/action`, { action });
  return res.data.data;
}
```

The frontend just needs to respect:

* Which token is used (role).
* The shapes & status logic described above.

