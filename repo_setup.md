# 🚀 UHI Health Platform — Repository Setup Guide

This document provides a **clean, step-by-step setup** for running the complete UHI platform (backend + frontend).  
It is intended for **new contributors and automated tools** to bootstrap the project reliably.

---

# 📦 1. Prerequisites

Make sure the following are installed:

- **Node.js** ≥ 18  
- **npm** ≥ 9  
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**
- (Optional) **VS Code** with ESLint + Prettier extensions

Clone the repository:

```sh
git clone <repo-url>
cd uhi-hackathon
````

---

# ⚙️ 2. Environment Variables

## 2.1 Create backend `.env`

Inside `/backend`, create a file named:

```
backend/.env
```

Copy from `.env.example`:

```sh
cp backend/.env.example backend/.env
```

Update values:

| Variable           | Description                                       |
| ------------------ | ------------------------------------------------- |
| PORT               | Backend port (default **4000**)                   |
| MONGO_URI          | Your MongoDB connection string                    |
| JWT_SECRET         | A long random secret (use `openssl rand -hex 24`) |
| AI_MODE            | `mock` or `live`                                  |
| OPENAI_API_KEY     | Only required if AI_MODE=live                     |
| FRONTEND_URL       | Usually `http://localhost:5173`                   |
| ALLOW_ADMIN_CREATE | Keep `false` unless intentionally adding admins   |

---

# 🗄️ 3. Install Dependencies

## Backend

```sh
cd backend
npm install
```

## Frontend

```sh
cd ../frontend
npm install
```

---

# 🧪 4. Seeding the Database (Optional)

The backend includes a rich dataset—doctors, patients, staff, consultations, prescriptions, LHP items, admin user, etc.

To seed:

```sh
cd backend
node src/db/seed/seed.js
```

This creates:

* Admin: `admin@test.com / admin123`
* Doctors (3)
* Patients (3)
* Staff (3)
* Consultation events
* Prescription events
* LHP entries

---

# ▶️ 5. Starting the System

## 5.1 Start Backend

```sh
cd backend
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

## 5.2 Start Frontend

```sh
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔑 6. Test Authentication (Recommended)

## Login as Admin

```sh
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq
```

Response sample:

```json
{
  "token": "JWT...",
  "role": "admin",
  "userId": "..."
}
```

Use the token for protected routes:

```sh
-H "Authorization: Bearer <TOKEN>"
```

---

# 🧱 7. Code Structure Overview

```
backend/
  src/
    modules/
      users/
      auth/
      consultations/
      prescriptions/
      lhp/
      ...
    middleware/
    db/
    routes/
    services/
frontend/
  src/
    api/
    components/
    pages/
    context/
    router/
```

Backend follows:

* Route → Controller → Service → Model layering
* Strict role-based access control
* JWT authentication

---

# 🔧 8. Common Issues & Fixes

### ❌ CORS blocked

➡ Update `FRONTEND_URL` in `.env`.

### ❌ Admin cannot create user

➡ Ensure token belongs to admin.
➡ `ALLOW_ADMIN_CREATE=false` prevents creating **additional admins** (by design).

### ❌ MongoDB connection error

➡ Check `MONGO_URI` syntax and IP whitelist.

### ❌ JWT invalid

➡ Ensure the `.env` JWT_SECRET matches backend expectations.

---

# 🤝 9. Contributing Workflow (Short Version)

1. Create branch:

```sh
git checkout -b feat/<feature-name>
```

2. Make changes
3. Format / lint code
4. Commit:

```sh
git commit -m "feat: description"
```

5. Push PR

More rules are in `CONTRIBUTING.md`.

---

# 🎯 10. Summary

After completing this setup:

✔ Backend reachable at `:4000`
✔ Frontend reachable at `:5173`
✔ Admin login works
✔ You can create doctor/patient/staff via single-step `/api/users`
✔ All seeded data is available for testing

The system is ready for frontend integration and feature development.

---
