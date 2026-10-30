# Campus360: AI-Powered Campus Operations & Intelligence Platform
## Hackathon V1 — Evaluation & Architecture Documentation

Campus360 is an enterprise-grade campus operations and intelligence system. It delivers real-time telemetry, natural-language AI incident understanding, timetable conflict detection, automated technician dispatch, inventory control with negative stock prevention, separation-of-duties governance, and an end-to-end classroom disruption relocation engine.

---

## 1. Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, **Vanilla CSS** (No Tailwind CSS), Framer Motion, Lucide React, Recharts.
- **Design System**: Linear & Stripe-inspired Light Enterprise Theme (`#F7F9FC` background, `#FFFFFF` cards, `#2563EB` primary, `#172B4D` navy typography, `#E5EAF1` subtle borders), responsive desktop/tablet/mobile layouts.
- **Backend**: Next.js Route Handlers, Server Actions, TypeScript, Prisma ORM.
- **Database**: PostgreSQL with persistent storage, foreign keys, unique constraints, enums, composite indexes, and ACID transactions.
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`) with automatic deterministic heuristic NLP fallback, Zod structured validation, and verification against PostgreSQL entities.
- **Security & RBAC**: 7 server-enforced roles, Bcrypt password hashing, session tokens, audit logging, `<RoleGuard>` protection, and separation-of-duties prevention.

---

## 2. Seeded Evaluation Personas (One-Click Login)

Default password for all accounts: **`password123`**

| Role | Name | Email | Permissions / Scope |
| :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `student@campus360.edu` | Student living portal, AI complaint assistant, personal ticket milestone tracking. |
| **Faculty / Professor** | Prof. Rajesh Kulkarni | `faculty@campus360.edu` | Academic equipment escalation, lecture hall availability, room reservations. |
| **Technician** | Ramesh Kumar | `tech@campus360.edu` | Work order execution, diagnostic notes, ticket status transitions (ASSIGNED ➔ IN_PROGRESS ➔ RESOLVED), SLA monitoring, warehouse parts reservation. |
| **Department Manager** | Dr. Priya Nair | `manager@campus360.edu` | Departmental facility monitoring, exam schedule tracking, staff workload oversight, repair escalations. |
| **Facilities Administrator** | Vikram Malhotra | `admin@campus360.edu` | Campus-wide operations, incident command center, classroom disruption relocation approval, building maintenance. |
| **Procurement Approver** | Ananya Iyer | `procurement@campus360.edu` | Spare parts restock reviews, purchase request authorization, inventory restock execution. |
| **System Administrator** | Devendra Patel | `sysadmin@campus360.edu` | Full platform control, audit log inspection, emergency administrative overrides, provider configurations. |

*Quick Role Switcher*: Click the role badge in the top navigation bar at any time to instantly switch between demo personas. Features, sidebar navigation, and dashboard views adapt immediately to the active role.

For complete setup instructions and guidelines for developers and AI agents, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 3. Database & Architecture Setup

### PostgreSQL Setup
Campus360 supports both standard standalone PostgreSQL instances (e.g. Docker, Supabase, Neon, or local PostgreSQL on port 5432) and includes a zero-dependency embedded PostgreSQL server listening on port 5433.

1. **Embedded Zero-Config PostgreSQL (Default)**:
   ```bash
   npm run db:start
   ```
   *Automatically initializes a PostgreSQL cluster and creates the `campus360` database.*

2. **Sync Database Schema**:
   ```bash
   npm run db:push
   ```

3. **Seed Database with Realistic Campus Records**:
   ```bash
   npm run db:seed
   ```

### Environment Variables (`.env`)
Create a `.env` file in the project root:
```env
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:password@localhost:5433/campus360?schema=public"

# AI Provider Keys (Optional: Intelligent Local Heuristic NLP active if omitted)
GROQ_API_KEY=""
GEMINI_API_KEY=""

# Security
JWT_SECRET="campus360-jwt-secret-key-enterprise-2026-v1"

# Simulated External Webhook
SIMULATED_WEBHOOK_URL="https://api.campus360.internal/v1/notifications/webhook"

# App Port
PORT=3000
```

---

## 4. Commands to Run the Application

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Push schema and seed data
npm run db:push
npm run db:seed

# 3. Start development server
npm run dev

# OR run production build
npm run build
npm run start
```
Open **`http://localhost:3000`** in your browser.

---

## 5. Key Modules & Implemented Features

### 1. Unified Admin Dashboard (`/dashboard`)
- Real-time KPI cards computed from PostgreSQL: Total incidents, open tickets, critical incidents, resolved tickets, overdue SLA requests, available technicians, room utilization %, and inventory shortages.
- Interactive Recharts: 7-day incident telemetry vs resolution rate, category distribution pie chart.
- Real-time audit activity feed and active critical alert stream.

### 2. Smart Ticketing System (`/dashboard/tickets`)
- Sequential unique ticket IDs (`CMP-2026-XXXX`).
- Full lifecycle state machine: `OPEN` ➔ `TRIAGED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`.
- Support for `BLOCKED` state (with required reason) and persistent `REOPENED` state.
- SLA countdown clock with overdue breach detection.
- Internal technician diagnostic notes and complete audit trail.

### 3. NLP Incident Intelligence Studio (`/dashboard/tickets/new`)
- Natural-language complaint understanding.
  - *Example prompt*: `"The projector in Block A Room 204 is not working. We have an examination tomorrow."`
- Extracts Category, verified Building, Room, Equipment, Urgency, Summary, Missing information questions, Duplicate candidates, and Academic Disruption Risk warning.
- Structured JSON output validated through Zod.
- Entity verification against PostgreSQL tables to prevent hallucinated rooms or assets.

### 4. Mandatory Disruption Scenario (`/dashboard/disruption`)
- Complete 12-step guided classroom disruption workflow:
  1. Creates electrical incident `INC-2026-0088` for Room A-204.
  2. Automatically locks Room A-204 to `UNAVAILABLE` in PostgreSQL.
  3. Queries PostgreSQL for impacted classes and examinations.
  4. Identifies the B.Sc AI & Data Science final exam with 60 students (10:00 AM – 12:00 PM).
  5. Scans campus rooms in PostgreSQL for alternatives.
  6. Multi-factor validation: Capacity $\ge$ 60, projector facilities, 0 timetable booking collisions.
  7. Displays eligible alternatives (e.g. Room A-301, Room A-205, Room B-101) and rejected rooms with verified criteria explanations (e.g. Room A-102 rejected: capacity 40 < 60; Room B-202 rejected: schedule collision).
  8. Facilities Administrator reviews and authorizes relocation.
  9. Pre-execution concurrency revalidation immediately before commitment.
  10. Atomic transaction updates `Examination` and `Booking` venues in PostgreSQL.
  11. Generates emergency in-app and simulated webhook broadcast notifications for students and faculty.
  12. Commits full audit trail to PostgreSQL `AuditLog`.
- Interactive reset button to restore the scenario back to initial baseline at any time.

### 5. Room & Timetable Management (`/dashboard/rooms`)
- Room directory with capacity filters, block filters, and installed facilities.
- Reservation engine with double-booking prevention and capacity check.
- Standalone Alternative Room Recommender evaluating live bookings.

### 6. Staff & Workforce Management (`/dashboard/staff`)
- Technician roster with skill specializations, morning/evening shifts, and live availability toggles.
- Real-time workload capacity bars ($N$ of 4 max concurrent tasks).
- Auto-assignment recommendation engine ranking technicians by skill match, shift, and lowest workload.

### 7. Inventory Management (`/dashboard/inventory`)
- Stock levels, min thresholds, bin locations, and low-stock warning badges.
- Restock and consumption controls.
- **Negative stock prevention** enforced by backend transactions.
- Automated ticket blocking if required components are out of stock.
- Purchase request submission modal linking to approvals.

### 8. Approval Center (`/dashboard/approvals`)
- Review of purchase requests, repairs, and room relocations.
- **Separation of duties**: Requesters are strictly prohibited from self-approving their own submissions.
- Role checks: Procurement Approvers authorize purchase orders, Facilities Admins authorize room changes.
- Pre-execution revalidation before updating inventory or bookings.

### 9. Notifications & Simulated Webhook (`/dashboard/notifications`)
- In-app notification inbox with read/unread filtering.
- Simulated external webhook dispatcher testing HTTPS TLS 1.3 delivery with ACK response timing.

### 10. Deep Analytics (`/dashboard/analytics`)
- Aggregated SLA compliance %, Mean Time to Resolution (hours), technician workload utilization, and recurring fault hotspot analysis using Recharts.

---

## 6. Features Pending & Known Limitations (V1 Scope)

1. **Physical Hardware IoT Sensors**:
   - V1 simulates electrical trips and breaker telemetry through software event dispatchers and database state transitions. Direct RS-485 / Modbus hardware sensor integration is planned for V2.
2. **Local Quantized LLM Runtime**:
   - V1 integrates the Groq Cloud API (`llama-3.3-70b-versatile`) with an intelligent offline regex/heuristic NLP fallback. Bundling a multi-gigabyte local GGUF/Ollama model directly into the web application repository was deferred to avoid 4GB+ binary bloat during the hackathon evaluation.
3. **SMS / Email Push Gateways**:
   - Dispatches emergency notifications to the in-app notification center and simulates external webhook payloads. Twilio SMS and SendGrid SMTP adapters can be plugged in using the existing `dispatchSimulatedWebhook` interface.

