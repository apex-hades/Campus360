# Contributing to Campus360

Welcome to **Campus360** — an AI-powered campus operations, smart ticketing, incident intelligence, and facility failover platform.

This guide is designed for both **human developers** and **autonomous AI coding agents** (e.g., Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf) to clone, configure, run, develop, and submit pull requests to [https://github.com/apex-hades/Campus360](https://github.com/apex-hades/Campus360).

---

## 1. System Architecture & Tech Stack

Before making code changes, ensure you or your AI agent review the stack:

| Layer | Technology | Key Constraints |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Dynamic route handlers use `export const dynamic = 'force-dynamic'` |
| **Language** | TypeScript | Strict typing with Zod schemas for input validation |
| **Styling** | **Vanilla CSS Only** | **DO NOT install or use Tailwind CSS**. All design tokens live in `src/app/globals.css` |
| **ORM** | Prisma ORM 5.14 | Schema in `prisma/schema.prisma` |
| **Database** | PostgreSQL | Local embedded server (`scripts/db-server.js` on port `5433`) or external PG |
| **AI / NLP** | Groq SDK + Heuristic Engine | Cloud inference via Groq; offline deterministic NLP fallback active if no API key |
| **Icons & Charts**| Lucide React & Recharts | Light enterprise theme (CartesianGrid `#E5EAF1`, navy headings `#172B4D`) |
| **Animations** | Framer Motion | Restrained, subtle micro-interactions |

---

## 2. Prerequisites

Ensure your environment has the following installed:

- **Node.js**: `v18.x` or `v20.x` LTS
- **npm**: `v9.x` or `v10.x`
- **Git**: `v2.x`
- **Operating System**: Windows, macOS, or Linux (cross-platform compatible)

---

## 3. Quickstart Guide (Step-by-Step for Developers & Agents)

Execute the following commands in sequence from your terminal or AI command runner:

### Step 1: Clone the Repository
```bash
git clone https://github.com/apex-hades/Campus360.git
cd Campus360
```

### Step 2: Configure Environment Variables
Copy the template configuration file:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/campus360?schema=public"
JWT_SECRET="campus360-jwt-secret-key-enterprise-2026-v1"
GROQ_API_KEY="" # Optional: cloud LLM API key
PORT=3000
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Embedded PostgreSQL Database
Campus360 includes an embedded PostgreSQL runner that creates a local persistent cluster without requiring external PostgreSQL installation:
```bash
npm run db:start
```
*Keep this process running in a background terminal or daemon task. It binds to port `5433`.*

### Step 5: Push Database Schema & Seed Demo Records
In a new terminal window:
```bash
# Push schema to database
npm run db:push

# Populate realistic campus records (7 personas, rooms, inventory, exam, SLA rules)
npm run db:seed
```

### Step 6: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Evaluation Personas (Seeded Accounts)

You can switch personas on the login page (`/login`) or via the top-navigation dropdown:

| Persona Role | Email | Password | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus360.edu` | `password123` | Report campus maintenance issues, view personal complaint timeline |
| **Faculty / Professor** | `faculty@campus360.edu` | `password123` | Classroom equipment escalation, check lecture hall availability & book rooms |
| **Lead Technician** | `tech@campus360.edu` | `password123` | View assigned work orders, progress status, reserve spare parts |
| **Department Manager** | `manager@campus360.edu` | `password123` | Department SLA metrics, staff oversight, incident tracking |
| **Facilities Administrator** | `admin@campus360.edu` | `password123` | Full campus operations, room relocations, 12-step disruption scenario |
| **Procurement Approver** | `procurement@campus360.edu` | `password123` | Purchase order reviews, financial sign-offs, stock audits |
| **System Administrator** | `sysadmin@campus360.edu` | `password123` | Platform superuser, system telemetry, security audit logs |

---

## 5. Critical Engineering Rules for AI Coding Agents

If you are an AI assistant (Antigravity, Cursor, Copilot, etc.) contributing to this repository, **you must obey the following architectural invariants**:

### 🚫 1. Never Introduce Tailwind CSS
- The project adheres to a strict Vanilla CSS design system.
- All styles, utility classes, and tokens are located in `src/app/globals.css`.
- Use the predefined CSS variables:
  - Background: `--bg-base` (`#F7F9FC`), Surface: `--bg-surface` (`#FFFFFF`)
  - Primary Accent: `--primary` (`#2563EB`), Hover: `--primary-hover` (`#1D4ED8`)
  - Navy Typography: `--text-heading` (`#172B4D`), Secondary: `--text-secondary` (`#64748B`)
  - Borders: `--border-subtle` (`#E5EAF1`), Shadows: `--shadow-sm`
  - Badges: `.badge .badge-primary`, `.badge-success`, `.badge-warning`, `.badge-critical`, `.badge-purple`, `.badge-info`

### 🛡️ 2. Enforce Role-Based Access Control (RBAC)
- All navigation visibility is managed via `src/lib/permissions.ts` and `src/components/RoleContext.tsx`.
- Whenever adding a new route or administrative feature, protect it using `<RoleGuard>`:
  ```tsx
  import RoleGuard from '@/components/RoleGuard';

  export default function MyNewFeaturePage() {
    return (
      <RoleGuard
        allowedRoles={['FACILITIES_ADMIN', 'SYSTEM_ADMIN']}
        featureName="My Feature Name"
      >
        {/* Protected UI */}
      </RoleGuard>
    );
  }
  ```

### 🔒 3. ACID Transactions & Separation of Duties
- **Negative Stock Protection**: Never allow inventory stock counts to drop below zero. Validate quantities inside `prisma.$transaction`.
- **Separation of Duties**: In `src/app/api/approvals/[id]/route.ts`, verify that the approver is NOT the user who raised the purchase request.
- **Room Conflict Detection**: Booking endpoints must verify overlapping time windows and room capacity before confirming reservations.

### 🤖 4. AI NLP Extraction Fallback
- `POST /api/ai/analyze-complaint` utilizes the Groq SDK when `GROQ_API_KEY` is present.
- If the API key is empty or rate-limited, the system seamlessly uses the heuristic regex/NLP extractor in `src/lib/ai.ts`. **Do not remove or bypass this fallback.**

---

## 6. Git Contribution Workflow

Follow standard GitHub pull request procedures when submitting enhancements:

### Step 1: Branch from `main`
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```
*Branch naming convention:*
- `feature/feature-description`
- `fix/bug-fix-description`
- `docs/documentation-update`

### Step 2: Implement Changes
- Write clean, modular, and typed TypeScript code.
- Maintain existing comments and docstrings.
- Test your changes locally in both desktop and mobile viewports.

### Step 3: Verify the Build
Always run a full production build before committing:
```bash
npm run build
```
Ensure that **all static and dynamic pages compile with exit code `0`**.

### Step 4: Commit Your Changes
Use concise, conventional commit messages:
```bash
git add .
git commit -m "feat: add classroom A/V equipment diagnostic telemetry"
```

### Step 5: Push and Open a Pull Request
```bash
git push -u origin feature/your-feature-name
```
Navigate to **[https://github.com/apex-hades/Campus360](https://github.com/apex-hades/Campus360)** and click **"New Pull Request"**.

---

## 7. Useful Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Compiles an optimized Next.js production build |
| `npm run start` | Runs the compiled production server |
| `npm run db:start` | Launches the local embedded PostgreSQL daemon on port 5433 |
| `npm run db:push` | Pushes Prisma schema updates to the database |
| `npm run db:seed` | Resets and seeds demo data |
| `npm run db:studio` | Opens Prisma Studio GUI to view database tables |

---

*Campus360 Engineering Team • Enterprise Operations & Intelligence*

