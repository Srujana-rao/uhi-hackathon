
---

# 3) `CONTRIBUTING.md` (paste into `uhi-hackathon/CONTRIBUTING.md`)

```markdown
# Contributing guide (UHI Hackathon)

## Branching
- Fork and create a feature branch: `feature/<module>-<brief>`
  - e.g. `feature/consultations-backend`
- Keep PRs small and focused. Use descriptive titles.

## Commit & PR rules
- Use meaningful commits.
- Push to your fork and open PR to the main repo.
- Reviewer(s): at least one teammate reviews before merge.
- Resolve merge conflicts locally; do not force-push to `main`.

## Running locally
See `repo_setup.md` for local run instructions.

## Code style
- Backend: Node/Express (JS or TS). Keep consistent style (prettier/eslint recommended).
- Frontend: React + Vite.

## Tests (optional)
- Keep minimal tests if time permits. Add tests under `backend/tests/`.

## Admin access
- Admin is not a DB entity. The admin API-key is stored in `backend/.env` as `ADMIN_API_KEY`.
- Admin-only routes must check admin JWT (issued after admin-key login).
- **DO NOT** commit admin key to the repo.

## Mock AI contract
- All AI calls go through `backend/src/services/aiService/index.js`.
- Use `AI_MODE=mock` for dev; template mock JSON files are in `backend/src/services/aiService/templates/`.

## Formatting
- Run `prettier` before creating PRs if available.

