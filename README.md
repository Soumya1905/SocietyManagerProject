# Society Maintenance Tracker

A full-stack web application that lets residents of an apartment society raise and track
maintenance complaints, and lets administrators triage, prioritize, and resolve them through a
structured, auditable workflow. Built as an independent rebuild on a lightweight
React + Hono + Drizzle + PostgreSQL stack.

## Project Overview

Apartment societies often struggle to track maintenance issues once they're reported over
WhatsApp or a physical register: residents lose visibility into progress, admins can't tell what's
overdue, and there's no record of who changed what and why. This app solves that with:

- A resident portal to raise complaints (with an optional photo), track their status, and read
  society notices.
- An admin portal to triage all complaints, set priority, update status through a fixed lifecycle,
  and see overdue issues at a glance on a dashboard with charts.
- A complete, immutable status history for every complaint, so nothing is lost.

## Features

### Resident Features
- Register and log in (JWT-based session).
- Personal dashboard: complaint counts by status, recent complaints, latest notices.
- Raise a complaint with category, description, and an optional photo (client + server validated).
- View only their own complaints, filterable by status and category.
- Full complaint detail view with a visual status timeline.
- Browse the notice board, with important notices pinned to the top.
- View their profile.

### Admin Features
- Admin dashboard: total/open/in-progress/resolved/overdue stat cards, a status bar chart, a
  category pie chart, and lists of overdue, high-priority, and recent complaints.
- View, search, and filter **all** complaints by category, status, priority, date range, and
  overdue state; sort by date, priority, or status.
- Update complaint priority (Low/Medium/High) at any time.
- Move a complaint through its lifecycle (Open → In Progress → Resolved) with an optional note —
  invalid or backward transitions are rejected.
- Every status change is recorded in an append-only history table.
- Create, edit, delete, and pin ("important") society notices, with a confirmation dialog before
  deletion.

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast dev loop, small footprint, strong typing |
| Routing | React Router | Standard client-side routing with nested layouts/guards |
| Forms | React Hook Form + Zod | Minimal re-renders, shared-shape schema validation |
| Styling | Tailwind CSS | Utility-first, no heavy component framework |
| Charts | Recharts | Lightweight, composable SVG charts |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Backend | Node.js + TypeScript + Hono | Minimal, fast, web-standard API framework (no Express) |
| ORM | Drizzle ORM + Drizzle Kit | Type-safe SQL, explicit migrations, no heavy runtime |
| Database | PostgreSQL | Relational integrity for complaints/history/users |
| Auth | JWT + bcrypt | Stateless sessions, industry-standard password hashing |
| Testing | Vitest (+ React Testing Library, backend Vitest + Hono `app.request`) | One test runner across both packages |

## Architecture

```
 React (Vite, TS)  --HTTP/JSON, multipart for photos-->  Hono API (Node, TS)
        |                                                        |
   localStorage                                          Drizzle ORM (node-postgres)
   (JWT token)                                                   |
                                                             PostgreSQL
                                                        (users, complaints,
                                                      complaint_history, notices)
```

The client is a pure SPA that talks to the API exclusively over `/api/*` REST endpoints (proxied
to the backend in dev by Vite). The API is a single Hono app (`server/src/app.ts`) composed of
route modules, each backed by a service module that owns the Drizzle queries and business rules.
Authentication is stateless JWT — the token is stored in `localStorage` and sent as a `Bearer`
header on every request; the server never trusts client-supplied roles beyond what's embedded in
the verified token via a fresh user lookup.

## Project Structure

```
SocietyManagerHiranmayi/
├── server/                    # Hono API
│   ├── src/
│   │   ├── index.ts           # process entrypoint (starts the HTTP listener)
│   │   ├── app.ts             # the Hono app itself (importable for tests)
│   │   ├── routes/            # thin HTTP handlers per resource
│   │   ├── services/          # business logic + Drizzle queries
│   │   ├── middleware/        # authenticateUser, requireRole, rateLimit, errorHandler
│   │   ├── validators/        # Zod schemas for request bodies/queries
│   │   ├── db/                # schema.ts, db client, migrate.ts, seed.ts
│   │   ├── utils/             # jwt, password hashing, overdue calculation, response helpers
│   │   ├── config/            # env var loading/validation
│   │   └── types/             # shared TS types
│   ├── drizzle/                # generated SQL migrations
│   ├── tests/                  # Vitest API tests (in-process, via app.request)
│   └── uploads/                 # local complaint photo storage (dev)
│
├── client/                     # React SPA
│   └── src/
│       ├── components/
│       │   ├── ui/             # Button, Input, Select, Textarea, Card, Modal, ConfirmDialog...
│       │   ├── complaints/     # StatusBadge, PriorityBadge, OverdueBadge, ComplaintTable, ...
│       │   ├── dashboard/      # DashboardStatCard, StatusChart, CategoryChart
│       │   └── notices/        # NoticeCard, NoticeForm
│       ├── pages/
│       │   ├── auth/           # Login, Register
│       │   ├── resident/       # Dashboard, RaiseComplaint, MyComplaints, ComplaintDetails, ...
│       │   └── admin/          # Dashboard, ComplaintManagement, ComplaintDetails, ...
│       ├── layouts/             # AuthLayout, DashboardLayout (Sidebar + Header)
│       ├── routes/              # ProtectedRoute, RoleProtectedRoute
│       ├── context/             # AuthContext, ToastContext
│       ├── services/            # axios client + one module per API resource
│       └── types/               # shared TS types mirroring the API contract
│
└── .gitignore
```

## Installation

```bash
git clone <repository-url>
cd society-maintenance-tracker

cd server
npm install

cd ../client
npm install
```

## Database Setup

1. Create a PostgreSQL database (locally, or with Neon/Railway/Render):
   ```sql
   CREATE DATABASE society_tracker;
   ```
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` to point at it.
3. Generate and apply migrations:
   ```bash
   cd server
   npm run db:generate   # writes SQL into server/drizzle/ from src/db/schema.ts
   npm run db:migrate    # applies them to DATABASE_URL
   ```
4. Seed realistic demo data:
   ```bash
   npm run db:seed
   ```
   This creates one admin, four residents, eight complaints spanning every status/priority
   (including an overdue one), full status history for each, and four notices (two important).

   **Default credentials after seeding:**
   - Admin: `admin@society.dev` / `Admin@123`
   - Resident: `rahul@society.dev` / `Resident@123`

## Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign/verify JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `OVERDUE_THRESHOLD_DAYS` | Days after which an unresolved complaint is "overdue" |
| `UPLOAD_DIR` | Local directory for uploaded complaint photos |
| `MAX_FILE_SIZE` | Max photo upload size in bytes |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL the SPA calls (`/api` works with the Vite dev proxy) |

## Running the Application

```bash
# Terminal 1 — API on http://localhost:5000
cd server
npm run dev

# Terminal 2 — SPA on http://localhost:5173
cd client
npm run dev
```

## Testing

```bash
# Backend (needs DATABASE_URL reachable; uses server/.env.test if present)
cd server
npm test

# Frontend
cd client
npm test
```

The backend suite covers registration/login, auth & role middleware, complaint creation, listing
with resident/admin scoping, valid/invalid status transitions, history creation, priority updates,
overdue detection, notice CRUD, dashboard aggregation, and one full end-to-end lifecycle test
(register → raise → admin triage → resolve → resident re-view). The frontend suite covers auth
form validation, protected/role-protected routing, complaint form + image upload validation,
badge/timeline rendering, overdue display, and notice importance/ordering.

## Production Build

```bash
cd server && npm run build && npm start
cd client && npm run build && npm run preview
```

## API Documentation

All responses follow `{ "success": true, "data": ... }` or `{ "success": false, "message": ... }`.

### Auth
| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | none | `{ fullName, email, password, apartmentNumber }` |
| POST | `/api/auth/login` | none | `{ email, password }` |
| POST | `/api/auth/logout` | none | — |
| GET | `/api/auth/me` | Bearer | — |

### Complaints
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | `/api/complaints` | Resident/Admin | `multipart/form-data` (`category`, `description`, optional `photo`) or JSON |
| GET | `/api/complaints` | Resident/Admin | Residents see only their own; query: `search, category, status, priority, overdue, dateFrom, dateTo, sortBy, sortOrder` |
| GET | `/api/complaints/:id` | Resident/Admin | Includes full `history[]`; residents blocked from others' complaints |
| PATCH | `/api/complaints/:id/status` | Admin only | `{ status, note? }`, enforces `OPEN→IN_PROGRESS→RESOLVED` |
| PATCH | `/api/complaints/:id/priority` | Admin only | `{ priority }` |

### Notices
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/notices` | Resident/Admin |
| POST | `/api/notices` | Admin only |
| PATCH | `/api/notices/:id` | Admin only |
| DELETE | `/api/notices/:id` | Admin only |

### Dashboard
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/dashboard/resident` | Resident only |
| GET | `/api/dashboard/admin` | Admin only |

## Database Schema

- **`users`** — `id, full_name, email (unique), password_hash, apartment_number, role (RESIDENT\|ADMIN), created_at, updated_at`. Indexed on `email`, `role`.
- **`complaints`** — `id, resident_id → users.id, category, description, photo_url, status (OPEN\|IN_PROGRESS\|RESOLVED), priority (LOW\|MEDIUM\|HIGH), created_at, updated_at, resolved_at`. Indexed on `resident_id, status, priority, category, created_at`.
- **`complaint_history`** — `id, complaint_id → complaints.id, previous_status, new_status, actor_id → users.id, note, created_at`. Append-only audit trail; one row per creation and per status change.
- **`notices`** — `id, title, content, is_important, created_by → users.id, created_at, updated_at`.

## Deployment

- **Frontend**: build with `npm run build` in `client/`, deploy the `dist/` output to Vercel or
  Netlify. Set `VITE_API_URL` to the deployed API's full URL (not the dev-only `/api` proxy path).
- **Backend**: deploy `server/` to Railway or Render as a Node service (`npm run build && npm start`).
  Set all variables from the env table above; run `npm run db:migrate` (and optionally `db:seed`)
  as a one-off release step.
- **Database**: use Neon, Railway Postgres, or Render Postgres; point `DATABASE_URL` at it. Ensure
  `sslmode=require` is included if the provider mandates TLS.

---

## System Design

**Architecture.** The system is a classic three-tier SPA: a React/Vite frontend, a stateless Hono
API, and a PostgreSQL database accessed exclusively through Drizzle ORM. The API is one Hono
app (`app.ts`) mounting four route modules (`auth`, `complaints`, `notices`, `dashboard`), each
delegating all business logic to a corresponding service module — routes stay thin (parse input,
call service, shape response) so the same logic is trivially testable by importing `app` directly
in Vitest and calling `app.request()`, with no network server needed.

**Authentication and authorization.** Passwords are hashed with bcrypt (10 salt rounds) and never
returned in any API response — services strip `passwordHash` before returning a user object.
Login/registration issue a JWT (`sub`, `role`, `email`) signed with `JWT_SECRET`. Every protected
route runs `authenticateUser` middleware, which verifies the token and re-fetches the user from
the database (so a deleted or role-changed user is rejected immediately, not just at token
issuance). `requireRole("ADMIN")` is a second middleware layered on top for admin-only routes.
Enforcement lives entirely on the backend — the frontend's `ProtectedRoute`/`RoleProtectedRoute`
only improve UX by redirecting before a doomed request is made; a resident calling an admin
endpoint directly still gets a `403` from the server.

**Complaint data model and history design.** `complaints` holds current state; `complaint_history`
is a separate, append-only table recording every transition (`previous_status → new_status`,
`actor_id`, optional `note`, timestamp). The complaint's initial `OPEN` state itself is written as
the first history row (`previous_status = null`) at creation time, so the full lifecycle — from
creation to resolution — is reconstructable purely from `complaint_history`, independent of the
current row in `complaints`. This was chosen over a single mutable `status` column with a
"last updated by" field because the requirement is an audit trail, not just current state; an
admin or resident should be able to see *who* moved a complaint from Open to In Progress and *why*,
not just that it happened.

**Status lifecycle and transactions.** The lifecycle is a strict, one-directional state machine —
`OPEN → IN_PROGRESS → RESOLVED` — encoded as an explicit adjacency map in
`complaintService.updateComplaintStatus`. Any transition not in that map (including staying put,
skipping a step, or going backward) is rejected with a `400` before any write happens. The status
update itself — updating `complaints.status`/`resolved_at` and inserting the corresponding
`complaint_history` row — is wrapped in a single `db.transaction()`, so a failure inserting the
history row rolls back the status change and vice versa; the two can never drift out of sync.

**Overdue detection.** Rather than scattering "is this late?" logic across the dashboard, the
complaint list, and complaint details, a single utility (`utils/overdue.ts`) computes
`{ isOverdue, overdueDays }` from `createdAt`, `status`, and the configurable
`OVERDUE_THRESHOLD_DAYS` env var. Every service that returns a complaint (list, details, dashboard
aggregation) runs its rows through this same function, so the definition of "overdue" can never
diverge between views. A `RESOLVED` complaint is never overdue, regardless of how long it took.

**Photo upload handling.** Complaint photos are optional and validated on both sides: the client
checks MIME type and a 5MB limit before upload (for instant feedback and to avoid wasting
bandwidth), and the server re-validates independently in `uploadService.ts` since client checks
are trivially bypassable. Storage is isolated behind `saveComplaintPhoto()`, which today writes to
a local `uploads/` directory with a randomly generated filename and returns a public URL path —
swapping this for S3 or Cloudinary later means changing one function, not touching
`complaintService` or the route handler.

**Dashboard data flow.** Both dashboard endpoints compute their statistics live from the database
on every request — no cached or precomputed counters — by loading the relevant complaint rows
once per request and deriving all counts (by status, by category, overdue, high-priority) from
that single result set in memory. This keeps the numbers always consistent with the underlying
data at the cost of scanning the complaints table per dashboard load, an acceptable trade-off at
society scale (hundreds, not millions, of complaints).

**Key technical decisions.** Hono was chosen over Express for a smaller surface area and native
TypeScript-first routing; Drizzle over Prisma for SQL-shaped, migration-explicit queries without a
generated client or engine binary; and a single shared response envelope
(`{ success, data }` / `{ success, message }`) so the frontend has one error-handling path
(`extractErrorMessage`) for every API call.
