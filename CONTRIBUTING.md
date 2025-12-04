# 🏥 UHI Platform — Contributing Guide

Welcome to the UHI Health Platform repository!
This document explains **how to contribute cleanly, safely, and consistently** to this codebase.

---

# 🚀 1. Branching Strategy

We follow a **feature-based workflow**:

| Branch       | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `main`       | Production-ready code only                               |
| `develop`    | Integration branch (optional — depends on team workflow) |
| `feat/*`     | New features                                             |
| `fix/*`      | Bug fixes                                                |
| `docs/*`     | Documentation changes                                    |
| `refactor/*` | Code improvements without changing behavior              |

### Creating a new branch

```
git checkout -b feat/<feature-name>
```

Examples:

```
feat/admin-user-create
fix/auth-token-refresh
docs/backend-architecture
```

---

# 🛠 2. Commit Message Rules

We use **structured commits**:

```
<type>: <short description>

[optional body]
```

### Allowed `<type>` values:

* `feat:` – new feature
* `fix:` – bug fix
* `refactor:` – code cleanup without behavior change
* `docs:` – documentation updates
* `chore:` – misc, configs, tooling
* `test:` – add/update tests

### Examples

```
feat: add single-step doctor creation API
fix: enforce patient-level access control
docs: update backend architecture overview
refactor: simplify session transaction handling
```

---

# 🧩 3. Project Structure Expectations

Contributions must follow the existing modular architecture:

```
backend/
  src/
    modules/
      <feature>/
        *.controller.js
        *.service.js
        *.routes.js
```

### Required conventions:

✔ Controllers must remain **thin** (no business logic)
✔ Services contain **all domain logic**
✔ Routes only mount controllers + middleware
✔ Models stay inside `/db/models`
✔ Use Mongoose `.lean()` for read operations
✔ Never return `passwordHash` in responses

---

# 🔐 4. Security & Access Control Rules

All contributions must align with backend security properties:

### Authentication

* JWT required for all protected endpoints
* Tokens must use `Authorization: Bearer <token>`

### Role restrictions

* **Admin only:**

  * `/api/users` creation
  * List all users
  * Delete users

* **Doctor:**

  * Access only own patients’ restricted profile fields
  * Full LHP only if they have an active ConsultationEvent with that patient

* **Patient:**

  * May view only their own data
  * Cannot enumerate other users

* **Staff:**

  * Limited read-only access

If you add new routes, ensure they use the correct middlewares:

```
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');
```

---

# 🧪 5. Testing & Verification Before Submitting

Before opening a PR:

### 5.1 Start backend locally

```
npm run dev
```

### 5.2 Verify login works

```
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### 5.3 Test critical APIs

#### Create doctor (single-step)

```
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
        "email": "newdoc@test.com",
        "password": "pass123",
        "role": "doctor",
        "doctor": {
          "name": "Test Doc",
          "specialization": "Cardio",
          "registrationNumber": "REG123"
        }
      }'
```

#### Check access control

* Patient should NOT access `/api/users/:id` for others
* Doctor should get only restricted patient fields
* Admin should get all fields

---

# 🧹 6. Code Style Rules

### JavaScript / Node Standards:

✔ Use **async/await**
✔ Use `try/catch` in controllers
✔ No business logic inside routes
✔ No raw DB queries inside controllers
✔ Use consistent naming:

* Services: `*.service.js`
* Controllers: `*.controller.js`
* Routes: `*.routes.js`

### Linting (recommended)

```
npm install eslint --save-dev
```

---

# 📦 7. Environment Variables

A `.env.example` file exists.
Before running backend locally:

```
cp .env.example .env
```

Required fields:

```
PORT=4000
MONGO_URI=...
JWT_SECRET=...
ALLOW_ADMIN_CREATE=false
FRONTEND_URL=http://localhost:5173
AI_MODE=mock
```

Never commit `.env`.

---

# 🔄 8. Pull Request Process

1. Ensure your branch is rebased on the latest `main`

   ```
   git pull origin main --rebase
   ```

2. Push your branch:

   ```
   git push origin feat/<feature-name>
   ```

3. Open a PR:

   * Add a description
   * Reference issues
   * Include screenshots or curl tests

4. At least one reviewer must approve

5. After merge, delete your branch

---

# 💬 9. Asking for Help

Open a GitHub issue of the appropriate type:

* 🐞 Bug report
* 🚀 Feature request
* ❓ Clarification needed
* 🔧 Tech debt / cleanup proposal

Or use project communication channels.

---

# 🎉 10. Thank You

Your contributions make UHI better for everyone — doctors, patients, staff, and the community.

---
