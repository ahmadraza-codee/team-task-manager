# Team Task Manager

A full-stack Team Task Manager built for the Full Stack Development Assessment.
Users can register/login securely, create teams, add members, and create / assign / manage tasks — with search & filters, due-date reminders, role-based team deletion, and stubbed email invites.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express (REST API) |
| Auth | Passport.js (passport-local) + express-session, HTTP-only cookies |
| Session store | PostgreSQL via connect-pg-simple when `DATABASE_URL` is set, memory store fallback in dev |
| Database | PostgreSQL (GCP Cloud SQL) via `pg`, with in-memory fallback for instant local demo |
| Passwords | bcryptjs hashing (never plain text) |
| Validation | express-validator on every input |
| Deployment | Google Cloud Platform — Cloud Run + Cloud SQL |

## Features
- Register / Login / Logout / current-user (`/api/auth/*`), protected routes
- Teams: create, list, edit, delete; add/remove members
- Tasks: create, assign, update, delete; filter by team, assignee, status, and search text
- Task create/update modal, dashboard with team list + task list, responsive UI, status/priority badges, overdue dates in red, empty states
- **Bonus 1 — Due-date reminders:** shown on login/dashboard (due today + overdue), plus `GET /api/tasks/reminders`
- **Bonus 2 — Role-based access:** only the team creator/owner can delete a team (enforced on backend; button hidden in UI for others)
- **Bonus 3 — Email invites (stubbed):** `POST /api/teams/:id/invite` creates an invite record and logs it — no SMTP, as specified

## Folder Structure
```
team-task-manager/
  backend/src/
    config/passport.js      # Passport local strategy
    db/ index.js            # picks Postgres or memory implementation
        memory.js           # in-memory fallback (same interface)
        postgres.js         # pg implementation
        schema.sql          # users, teams, team_members, tasks, invites
    middleware/auth.js      # requireAuth, requireTeamMember
    validators/index.js     # express-validator rules
    routes/ auth.js teams.js tasks.js
    app.js server.js
  frontend/src/
    context/AuthContext.jsx  components/ (Navbar, TaskModal, MemberPanel, ReminderBanner, ProtectedRoute)
    pages/ (Login, Register, Dashboard)  lib/api.js
  docker-compose.yml
```

## Local Setup

### Option A — instant, no database (memory fallback)
```bash
cd backend && cp .env.example .env && npm install && npm run dev   # http://localhost:5000  (omit DATABASE_URL from .env)
cd ../frontend && cp .env.example .env && npm install && npm run dev # http://localhost:5173
```
Demo user (memory mode only): `demo@example.com` / `demo1234`

### Option B — with PostgreSQL via Docker
```bash
docker compose up --build
# or run Postgres only: docker compose up db, then set DATABASE_URL in backend/.env and run both apps with npm run dev
```
Schema is applied automatically on backend start when `DATABASE_URL` is set (or manually: `psql "$DATABASE_URL" -f backend/src/db/schema.sql`).

## API
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/auth/register · /login · /logout | Auth (login returns reminders) |
| GET | /api/auth/me | Current user + reminders |
| GET/POST | /api/teams | List my teams (+ users) / create team |
| GET/PUT/DELETE | /api/teams/:id | Team detail / update / delete (owner only) |
| POST/DELETE | /api/teams/:id/members[/:userId] | Add / remove member |
| POST | /api/teams/:id/invite | Stubbed email invite |
| GET/POST | /api/tasks?teamId=&assignee=&status=&search= | List (filtered) / create task |
| GET/PUT/DELETE | /api/tasks/:id | Task detail / update / delete |
| GET | /api/tasks/reminders | Due today + overdue for current user |

## GCP Deployment (Cloud Run + Cloud SQL)
1. Create a Cloud SQL for PostgreSQL instance and a database `team_task_manager`; note its connection name.
2. Backend:
```bash
gcloud run deploy team-task-backend --source backend --region europe-west2 --allow-unauthenticated \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars SESSION_SECRET=<long-random>,DATABASE_URL=postgresql://<user>:<pass>@/<db>?host=/cloudsql/<INSTANCE_CONNECTION_NAME>,CLIENT_URL=<frontend-url>,NODE_ENV=production,PORT=8080
```
(For Cloud Run the Postgres socket form above is standard; alternatively use the instance public IP connection string.)
3. Frontend (build arg points at the backend URL):
```bash
gcloud run deploy team-task-frontend --source frontend --region europe-west2 --allow-unauthenticated \
  --build-arg VITE_API_URL=<backend-url>   # if using gcloud builds submit, pass via a cloudbuild config; locally: docker build --build-arg VITE_API_URL=<backend-url> ./frontend
```
4. Update the backend's `CLIENT_URL` to the deployed frontend URL and redeploy the backend.

> Deployment config (Dockerfiles, env examples) is included and verified locally; an actual GCP deploy requires your own GCP project/credentials.

## Git & GitHub — branching / PR history (assessment requirement)
Do **not** push everything in one commit. Example flow:
```bash
git init && git checkout -b main && git add . && git commit -m "chore: project scaffold" && git push -u origin main
git checkout -b feature/auth && ... commit ... && git push -u origin feature/auth   # open PR -> main, merge
git checkout -b feature/teams-tasks ... # PR -> main
git checkout -b feature/frontend-dashboard ... # PR -> main
git checkout -b feature/bonus-and-deployment ... # PR -> main
```
This leaves a clear branch + Pull Request history on GitHub, as required.
