# UHI Hackathon — Platform (Monorepo)

This repository contains the UHI hackathon codebase (frontend + backend), mocks, and documentation.

## Quick overview
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- AI: `aiService` with `AI_MODE=mock|live`
- Admin: single API-key admin (hardcoded in `.env`). Admin is **not** a DB role.

## Repo layout
- `backend/` — Express server, models, routes, services (aiService mock/live)
- `frontend/` — React + Vite app
- `docs/` — architecture, API contracts, AI schemas, mock-data
- `README.md`, `repo_setup.md`, `CONTRIBUTING.md` — repo guidance

## Getting help
Open an issue in the repo or ping the team in your group chat with the failing command and the error message.

