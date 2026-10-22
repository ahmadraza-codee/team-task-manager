# Team Task Manager

A full-stack **Team Task Manager** built for the Full Stack Development Assessment — designed as a small professional SaaS product, not a simple to-do app.
Users register/login securely, create teams, add members, and create / assign / manage tasks, with a real-data dashboard, search & filters, due-date reminders, role-based team deletion, and stubbed email invites.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router |
| Backend | Node.js + Express (REST API, controllers / routes / middleware / validators) |
| Auth | Passport.js (passport-local) + express-session, HTTP-only cookies |
| Session store | PostgreSQL via connect-pg-simple when `DATABASE_URL` is set, memory store fallback in dev |
| Database | PostgreSQL (GCP Cloud SQL) via `pg`, with in-memory fallback for instant local demo |
| Passwords | bcryptjs hashing (never plain text) |
| Validation | express-validator on every input |
| Deployment | Google Cloud Platform — Cloud Run + Cloud SQL |

## Features
- **Auth UX:** Register (full name, email, password + confirm password, duplicate-email error), Login (show/hide password, loading state, invalid-credentials message), logout; already-logged-in users are redirected away from login/register.
- **SaaS layout:** left sidebar (Dashboard, My Tasks, All Tasks, Teams, Profile, user + Logout) and top header (welcome message, global task search, Create Task button, user avatar). Fully responsive — sidebar becomes a hamburger drawer on mobile.
- **Dashboard:** 4 stat cards computed from **real backend data** via `GET /api/dashboard` (Total Tasks, In Progress, Completed, Overdue), My Tasks, Recent Tasks, My Teams, Quick Actions, and a due-date reminder banner.
- **Teams:** create/edit/delete (delete owner-only), team search, member counts, a Team Details page with members list, add-member by registered email (clear "user not found" message), team task status summary and team-specific tasks.
- **Tasks:** create/edit modal (title, description, team, assignee from that team's members, status, priority, due date), tasks table (team, assignee, priority/status badges, overdue due dates in red, edit/delete with confirmation, inline status dropdown), filters that combine: search + team + assignee + status + priority.
- **Toasts** for success/error, plus loading, error and empty states throughout.
- **Bonus 1 — Due-date reminders:** shown on login/dashboard (due today + overdue), plus `GET /api/tasks/reminders`.
- **Bonus 2 — Role-based access:** only the team creator/owner can delete a team (enforced on the backend; button hidden in the UI for others).
- **Bonus 3 — Email invites (stubbed):** `POST /api/teams/:id/invite` creates an invite record and logs it — no SMTP, as specified.

Status values are stored as `todo` / `in_progress` / `done` and displayed as **To Do / In Progress / Completed**.

## Folder Structure
```
team-task-manager/
  backend/src/
    config/passport.js        # Passport local strategy
    controllers/              # authController, teamController, taskController, dashboardController (business logic)
    routes/                   # auth, teams, tasks, dashboard (thin — delegate to controllers)
    middleware/auth.js        # requireAuth, requireTeamMember
    validators/index.js       # express-validator rules (incl. PATCH variants)
    db/ index.js              # picks Postgres or memory implementation
        memory.js             # in-memory fallback (same interface)
        postgres.js           # pg implementation (parameterized queries only)
        schema.sql            # users, teams, team_members, tasks, invites
    app.js server.js
  frontend/src/
    context/                  # AuthContext, ToastContext, UIContext (global Create/Edit Task modal)
    components/               # Layout (sidebar+header), TaskModal, TaskTable, FiltersBar, MemberPanel, ReminderBanner, ProtectedRoute
    pages/                    # Login, Register, Dashboard, Tasks (also My Tasks), Teams, TeamDetails, Profile
    lib/ api.js, format.js
  docker-compose.yml
```

## Local Setup

### Option A — instant, no database (memory fallback)
`backend/.env.example` ships with `DATABASE_URL` **commented out**, so copying it gives you a working memory-mode setup out of the box:
```bash
cd backend && cp .env.example .env && npm install && npm run dev   # http://localhost:5000
cd ../frontend && npm install && npm run dev                        # http://localhost:5173
```
Demo user (memory mode only): `demo@example.com` / `demo1234`
To use PostgreSQL instead, uncomment `DATABASE_URL` in `backend/.env` and set your real password/database, then restart the backend.

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
| GET | /api/dashboard | Stats for current user: total / todo / in_progress / completed / overdue / my tasks / teams + recent & my tasks |
| GET/POST | /api/teams | List my teams (+ users) / create team |
| GET/PUT/PATCH/DELETE | /api/teams/:id | Team detail / update / delete (owner only) |
| GET | /api/teams/:id/members | Team members |
| POST/DELETE | /api/teams/:id/members[/:userId] | Add member (by `email` or `user_id`) / remove member |
| POST | /api/teams/:id/invite | Stubbed email invite |
| GET/POST | /api/tasks?teamId=&assignee=&assigneeId=&status=&priority=&search= | List (combined filters) / create task |
| GET/PUT/PATCH/DELETE | /api/tasks/:id | Task detail / update / delete |
| GET | /api/tasks/reminders | Due today + overdue for current user |

Authorization: unauthenticated requests get **401**; a logged-in non-member accessing another team's data gets **403**. A task's assignee must be a member of the task's team (validated on create and update).

## Security Checklist
- [x] Passwords hashed with bcryptjs; never stored or returned in plain text
- [x] Passport.js Local Strategy + server-side sessions (express-session)
- [x] PostgreSQL session store in production (connect-pg-simple); memory fallback in dev only
- [x] HTTP-only session cookie; `secure` in production; suitable `sameSite`
- [x] Session regenerated on successful login; session destroyed on logout
- [x] Every non-auth route protected; team-membership authorization on every team/task access (401 / 403)
- [x] Joi-style request validation via express-validator on all inputs (incl. PATCH)
- [x] Parameterized SQL queries only — no string concatenation
- [x] Login rate limiting: `express-rate-limit`, 100 requests / 15 min per IP on `/api/auth`
- [x] CORS restricted to the configured frontend origin (`CLIENT_URL`), with credentials
- [x] Secrets only via environment variables; `.env` is git-ignored

## GCP Deployment (Cloud Run + Cloud SQL)
1. Create a Cloud SQL for PostgreSQL instance and a database `team_task_manager`; note its connection name.
2. Backend:
```bash
gcloud run deploy team-task-backend --source backend --region europe-west2 --allow-unauthenticated \
  --add-cloudsql-instances <INSTANCE_CONNECTION_NAME> \
  --set-env-vars SESSION_SECRET=<strong-secret>,DATABASE_URL=<cloud-sql-connection-string>,CLIENT_URL=<frontend-url>
```
3. Frontend (build arg points at the backend URL):
```bash
gcloud run deploy team-task-frontend --source frontend --region europe-west2 --allow-unauthenticated
# build the frontend image with VITE_API_URL=<backend-url> (see frontend/Dockerfile)
```
4. Update the backend's `CLIENT_URL` to the deployed frontend URL and redeploy the backend. If frontend and backend are on different origins, verify credentialed CORS and cookie settings end-to-end.

> Deployment config (Dockerfiles, env examples) is included and verified locally; an actual GCP deploy requires your own GCP project/credentials. Cloud SQL may incur charges — check current pricing/free allowances and set budget alerts before creating services.

## Git & GitHub — branching / PR history (assessment requirement)
Development history is kept on feature branches and merged into `main`; `main` always contains the final working code. Do **not** squash everything into one commit.
```bash
gh repo create team-task-manager --private --source=. --push   # or: git remote add origin <url> && git push -u origin --all
# On GitHub, open a PR for each feature branch -> main and merge them.
```
Branches:
- `feature/auth` — Passport.js session auth, Postgres session store, bcrypt, validation, DB schema
- `feature/teams` — team CRUD, member add/remove, owner-only delete
- `feature/tasks` — task CRUD, search/filters, due-date reminders, invite stub
- `feature/frontend` — React + Vite + Tailwind pages, task modal, search & filters
- `feature/saas-dashboard` — SaaS layout (sidebar/header), dashboard stats endpoint + cards, separate Tasks/Teams/Team Details/Profile pages, controllers architecture, PATCH support, login rate limiting, session regeneration, auth UX (confirm password, show/hide, loading states), toasts, priority filter

Example commit messages: `feat: add session-based authentication` · `feat: implement team membership management` · `feat: add task assignment and filtering` · `fix: enforce team-level task authorization` · `docs: add setup and deployment instructions`

## Final Testing Checklist
- [ ] New user can register successfully.
- [ ] Duplicate email and wrong password are rejected.
- [ ] Session persists after refresh once logged in.
- [ ] After logout, protected API access is rejected.
- [ ] User can create, view, edit and delete a team according to permissions.
- [ ] An existing registered member can be added to a team.
- [ ] A team member can create and assign tasks.
- [ ] Task update, status change and delete work properly.
- [ ] Team and assignee filters return correct results.
- [ ] Using another team's task ID does not give unauthorized access.
- [ ] Validation errors show as readable messages on the frontend.
- [ ] Dashboard is usable on desktop and mobile.
- [ ] Deployed frontend, API and database work together.
- [ ] README contains setup, environment variables and deployment details.
- [ ] GitHub shows real feature-branch / merged-PR history.
