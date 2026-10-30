# Campus360 — System Architecture, Flow Diagrams & Database Schema Specification

> **AI-Powered Campus Operations & Intelligence Platform**  
> Hackathon Evaluation Blueprint & Technical Specification

---

## 1. System Architecture Diagram

Campus360 follows an enterprise-grade 4-tier modular architecture designed for high integrity, sub-200ms AI triage latency, strict role-based security boundaries, and ACID transactional consistency.

```mermaid
flowchart TD
    subgraph TIER1["Tier 1: Presentation & Client Layer (Next.js 14 App Router)"]
        UI_STUDENT["Student / Faculty View\n(Consumer-grade conversational intake)"]
        UI_ADMIN["Unified Operations Center\n(Hero KPI telemetry & Live Feeds)"]
        UI_TECH["Technician Field Console\n(Active jobs, SLA countdown, stock)"]
        UI_ARCH["Live Architecture & DB Specs\n(/dashboard/architecture)"]
    end

    subgraph TIER2["Tier 2: Business Logic & Authorization Engine"]
        GATEWAY["API Route Handlers & Server Actions"]
        RBAC["7-Persona RBAC Guard\n(permissions.ts)"]
        SOD["Separation of Duties Engine\n(requesterId !== approverId)"]
        AUDIT["Immutable Audit Ledger\n(AuditLog with JSON snapshots)"]
    end

    subgraph TIER3["Tier 3: AI & Operations Subsystem"]
        AI_GATEWAY["AI Gateway / Vercel AI SDK"]
        GROQ["Groq LLaMA-3.3-70B API\n(< 200ms Inference)"]
        HEURISTIC["Offline Heuristic Rule Engine\n(Fail-Safe Local Fallback)"]
        DISPATCH["Technician Skill & Workload Matcher"]
        DISRUPT["Classroom Conflict & Relocation Solver"]
    end

    subgraph TIER4["Tier 4: Relational Persistence Layer (PostgreSQL 16)"]
        PRISMA["Prisma ORM Client\n(Type-Safe Connection Pool)"]
        PG_DB[("PostgreSQL 16 Database\nPort 5433 (campus360)")]
        STUDIO["Prisma Studio Web GUI\nPort 5555"]
    end

    TIER1 -->|"HTTPS / JSON"| GATEWAY
    GATEWAY --> RBAC
    RBAC --> SOD
    SOD --> AUDIT
    GATEWAY --> AI_GATEWAY
    AI_GATEWAY -->|"Primary"| GROQ
    AI_GATEWAY -.->|"Offline Fallback"| HEURISTIC
    GATEWAY --> DISPATCH
    GATEWAY --> DISRUPT
    GATEWAY -->|"Typed Queries & Mutations"| PRISMA
    PRISMA -->|"ACID Transactions"| PG_DB
    STUDIO -->|"Direct Visual Introspection"| PG_DB
```

---

## 2. Core Workflow Diagrams

### Workflow A: AI-Powered Natural Language Incident Triage & Auto-Dispatch

This pipeline ingests unstructured student/faculty reports, runs NLP entity extraction, prevents duplicate dispatches, assigns SLAs, and pairs with the optimal technician.

```mermaid
sequenceDiagram
    autonumber
    actor Reporter as Student / Faculty
    participant App as Next.js App Router
    participant AI as Groq LLaMA 3.3 / Heuristic Fallback
    participant DB as PostgreSQL 16 (Prisma)
    actor Tech as Assigned Technician

    Reporter->>App: Submits plain English complaint<br/>("Projector in A-204 broken before final exam")
    App->>AI: POST /api/ai/analyze-complaint (Raw Text)
    AI-->>App: Structured Output (Category, Priority, Room, Equipment, Urgency)
    App->>DB: Query existing open tickets in Room A-204
    alt Duplicate Detected (similarity > 0.8)
        App->>DB: Link as duplicateOfId: "CMP-2026-0001"
        App-->>Reporter: "Linked to existing investigation in progress"
    else Unique Incident
        App->>DB: Calculate SLA (e.g. Critical = 2 Hours)
        App->>DB: Query available technicians matching skills (AV / Electrical)
        App->>DB: Atomic create: Ticket (CMP-2026-XXXX) + Assignment + Notification
        App-->>Tech: Push alert with location & urgency
        App-->>Reporter: Ticket CMP-2026-XXXX created & dispatched
    end
```

---

### Workflow B: Automated Classroom Disruption & Exam Relocation

Autonomous timetable relocation algorithm resolving conflicts before exams or lectures are disrupted.

```mermaid
flowchart TD
    START(["Classroom Equipment Malfunction Detected\n(e.g., Room A-204 AC & Projector Failure)"]) --> FLAG["Room Status set to MAINTENANCE"]
    FLAG --> CHECK{"Is Room currently booked\nfor an Examination or Class?"}
    
    CHECK -- No --> NORMAL["Schedule standard technician maintenance ticket"]
    CHECK -- Yes --> SOLVER["Trigger Timetable Relocation Engine"]
    
    SOLVER --> QUERY["Query PostgreSQL for Available Rooms\nFilters: Capacity >= 60, Status = AVAILABLE, Has Projector & AC"]
    
    QUERY --> EVAL{"Candidate Room Found?\n(e.g., Block B Room 101)"}
    
    EVAL -- Found --> ATOMIC["Execute ACID prisma.$transaction:\n1. Examination.roomId -> B-101\n2. Room B-101 -> OCCUPIED\n3. Room A-204 -> MAINTENANCE\n4. Write AuditLog (RELOCATE_EXAM)"]
    
    ATOMIC --> NOTIFY["Broadcast Real-time Alerts:\n- SMS & In-app to Invigilator (Prof. Vikram)\n- Push notification to 60 enrolled students\n- Facilities logistics escort dispatch"]
    
    EVAL -- None Found --> ESCALATE["Trigger High-Priority Facilities Override & Emergency Split"]
```

---

### Workflow C: Dual-Approval & Separation of Duties Governance

Enforces financial thresholds and prevents fraudulent self-approvals for parts and high-value repairs.

```mermaid
sequenceDiagram
    autonumber
    actor Tech as Technician (Field Operator)
    participant Core as Campus360 Governance Core
    participant DB as PostgreSQL (Prisma)
    actor Approver as Procurement Approver

    Tech->>Core: Request component purchase (PR-2026-0012: $340.00)
    Core->>Core: Validate threshold ($340.00 > $100.00 approval gate)
    Core->>DB: Create PurchaseRequest (Status: PENDING)
    Core->>DB: Create Approval (entityType: PURCHASE_REQUEST)
    Approver->>Core: Review pending purchase requests
    Core->>Core: Validate Separation of Duties:<br/>assert(requesterId !== approverId)
    alt Requester attempts self-approval
        Core-->>Approver: HTTP 403 Forbidden ("Self-approval prohibited by policy")
    else Legitimate Procurement Officer Approves
        Core->>DB: Atomic Transaction: Update PR to APPROVED, increment reserved inventory
        Core->>DB: Write Immutable AuditLog (ACTION: APPROVE_PURCHASE)
        Core-->>Tech: Alert: "Parts approved and released from warehouse"
    end
```

---

## 3. Database Schema & Entity-Relationship (ER) Model

The database is built on **PostgreSQL 16** and fully managed via **Prisma ORM**. It features 14 strongly typed relational models with foreign key cascade guarantees and indexing on query hot-paths.

```mermaid
erDiagram
    User ||--o| StaffProfile : "has 1:1"
    User ||--o{ Ticket : "reports"
    User ||--o{ Ticket : "assigned to"
    User ||--o{ TicketComment : "authors"
    User ||--o{ PurchaseRequest : "requests / approves"
    User ||--o{ Approval : "requests / decides"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "triggers"

    Building ||--o{ Room : "contains"
    Room ||--o{ Equipment : "houses"
    Room ||--o{ Examination : "hosts"
    Room ||--o{ ClassSchedule : "schedules"
    Room ||--o{ Ticket : "location for"

    Ticket ||--o{ TicketComment : "has"
    Ticket ||--o{ TicketHistory : "tracks"
    Ticket ||--o{ Assignment : "assigns"
    Ticket ||--o{ StockReservation : "reserves parts"
    Ticket ||--o{ IncidentTicket : "aggregates"
    Incident ||--o{ IncidentTicket : "contains"

    InventoryItem ||--o{ StockReservation : "allocates"
    InventoryItem ||--o{ PurchaseRequest : "restocks"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        enum role
        string department
    }

    Building {
        string id PK
        string code UK
        string name
        string campusZone
        int totalFloors
    }

    Room {
        string id PK
        string code UK
        string roomNumber
        int capacity
        enum roomType
        string[] facilities
        enum status
    }

    Equipment {
        string id PK
        string assetTag UK
        string name
        enum category
        enum status
    }

    Examination {
        string id PK
        string examCode UK
        string courseTitle
        int studentCount
        string roomId FK
        datetime examDate
        enum status
    }

    Ticket {
        string id PK
        string title
        string description
        enum category
        enum priority
        enum status
        string roomId FK
        string reporterId FK
        string assignedToId FK
        datetime slaDeadline
    }

    InventoryItem {
        string id PK
        string sku UK
        string name
        int quantity
        int minStockThreshold
        float unitCost
        string locationBin
        enum status
    }

    Approval {
        string id PK
        enum entityType
        string entityId
        string requesterId FK
        string approverId FK
        enum status
        json revalidationData
    }

    AuditLog {
        string id PK
        string action
        string entity
        string entityId
        string userId FK
        json details
        datetime createdAt
    }
```

---

## 4. How to Display the Database Schema to Evaluators

When evaluators ask to inspect your database schema, you have **three instant options**:

### Option 1: Live Interactive In-App Dashboard (Best & Fastest)
1. Open Campus360 at **`http://localhost:3000/dashboard/architecture`**
2. Click the **"3. Database Schema & ER Model"** tab.
3. Show the live model card breakdown (queries PostgreSQL directly in real-time).
4. Point out the real record counts: `Users: 8`, `Rooms: 6`, `Tickets: 4`, `Inventory: 4`, `AuditLog: 1`.

### Option 2: Live Prisma Studio Web GUI (Most Impressive)
Prisma Studio is already running in the background on port 5555.
1. Click the top-right button **"Open Live Prisma Studio (Port 5555)"** or navigate directly to **`http://localhost:5555`** in your browser.
2. In front of the evaluators, click on any table:
   - **`Ticket`**: Show real ticket codes like `CMP-2026-0001`, SLA deadlines, and foreign key relations.
   - **`Examination`**: Show the scheduled 60-student exam and how it links to `Room`.
   - **`AuditLog`**: Show the immutable JSON audit logs.
   - **`InventoryItem`**: Show warehouse bin locations and stock counts.
3. *Evaluator Proof*: If they think data is mocked, edit a record or create a ticket on the dashboard and click refresh in Prisma Studio — the new record appears immediately.

### Option 3: Terminal Inspection
If an evaluator asks to see the Prisma schema file directly:
```bash
# View the schema file
cat prisma/schema.prisma

# Verify PostgreSQL connection status
npx prisma db pull
```
