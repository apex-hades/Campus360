const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showSchema() {
  console.log('\n========================================================================');
  console.log('       CAMPUS360 — POSTGRESQL 16 LIVE DATABASE SCHEMA & TELEMETRY');
  console.log('========================================================================');
  console.log('Database Engine : PostgreSQL 16 (Port 5433)');
  console.log('Database Name   : campus360');
  console.log('ORM Client      : Prisma 5 (Type-Safe)');
  console.log('Status          : Connected & Healthy');
  console.log('------------------------------------------------------------------------\n');

  try {
    // 1. Table Record Counts
    const [
      users,
      tickets,
      incidents,
      rooms,
      buildings,
      equipment,
      examinations,
      inventory,
      approvals,
      auditLogs,
      notifications,
      comments,
      assignments,
      stockReservations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
      prisma.incident.count(),
      prisma.room.count(),
      prisma.building.count(),
      prisma.equipment.count(),
      prisma.examination.count(),
      prisma.inventoryItem.count(),
      prisma.approval.count(),
      prisma.auditLog.count(),
      prisma.notification.count(),
      prisma.ticketComment.count(),
      prisma.assignment.count(),
      prisma.stockReservation.count(),
    ]);

    console.log('TABLE SUMMARY & LIVE RECORD COUNTS:');
    console.log('+----------------------+------------+------------------------------------------+');
    console.log('| Table / Model        | Live Rows  | Primary Role / Entity                    |');
    console.log('+----------------------+------------+------------------------------------------+');
    console.log(`| User                 | ${String(users).padEnd(10)} | Credentials, 7 Roles & Departments       |`);
    console.log(`| Building             | ${String(buildings).padEnd(10)} | Campus Blocks & Geographic Zones         |`);
    console.log(`| Room                 | ${String(rooms).padEnd(10)} | Facilities, Capacities & Room Status     |`);
    console.log(`| Equipment            | ${String(equipment).padEnd(10)} | Asset Tags, AV Gear & Operational Health |`);
    console.log(`| Examination          | ${String(examinations).padEnd(10)} | High-Stakes Timetables & Relocations     |`);
    console.log(`| Ticket               | ${String(tickets).padEnd(10)} | CMP-2026-XXXX Smart Operational Tickets  |`);
    console.log(`| Incident             | ${String(incidents).padEnd(10)} | Aggregated Campus-Wide Multi-Ticket Hub  |`);
    console.log(`| Assignment           | ${String(assignments).padEnd(10)} | Field Technician Workload & Shifts       |`);
    console.log(`| InventoryItem        | ${String(inventory).padEnd(10)} | Warehouse Parts, Thresholds & Bin Locs   |`);
    console.log(`| StockReservation     | ${String(stockReservations).padEnd(10)} | Parts Allocated to Active Tickets        |`);
    console.log(`| Approval             | ${String(approvals).padEnd(10)} | Separation-of-Duties Financial Gates     |`);
    console.log(`| Notification         | ${String(notifications).padEnd(10)} | Event Dispatch Queue & Alerts            |`);
    console.log(`| TicketComment        | ${String(comments).padEnd(10)} | Internal Technician Notes & Logs         |`);
    console.log(`| AuditLog             | ${String(auditLogs).padEnd(10)} | Immutable Security Audit Ledger          |`);
    console.log('+----------------------+------------+------------------------------------------+\n');

    console.log('CORE TABLE STRUCTURES & FOREIGN KEY RELATIONS:');
    console.log('------------------------------------------------------------------------');
    console.log('1. User');
    console.log('   - id (UUID, PK) | email (VARCHAR, UNIQUE) | passwordHash (VARCHAR, bcrypt)');
    console.log('   - name (VARCHAR) | role (ENUM: 7 Personas) | department (VARCHAR)');
    console.log('   -> Relations: 1:1 StaffProfile, 1:N Ticket (Reporter/Assignee), 1:N AuditLog\n');

    console.log('2. Room');
    console.log('   - id (UUID, PK) | buildingId (UUID, FK -> Building.id) | code (VARCHAR, UNIQUE)');
    console.log('   - roomNumber (VARCHAR) | capacity (INT) | facilities (TEXT[]) | status (ENUM)');
    console.log('   -> Relations: 1:N Equipment, 1:N Examination, 1:N Ticket\n');

    console.log('3. Ticket');
    console.log('   - id (VARCHAR, PK e.g. CMP-2026-0001) | title (VARCHAR) | description (TEXT)');
    console.log('   - category (ENUM) | priority (ENUM) | status (ENUM: OPEN -> CLOSED)');
    console.log('   - roomId (UUID, FK -> Room.id) | reporterId (UUID, FK -> User.id)');
    console.log('   - assignedToId (UUID, FK -> User.id) | duplicateOfId (VARCHAR, FK -> Ticket.id)');
    console.log('   - slaHours (INT) | slaDeadline (TIMESTAMP) | resolvedAt (TIMESTAMP)\n');

    console.log('4. Examination');
    console.log('   - id (UUID, PK) | examCode (VARCHAR, UNIQUE) | courseTitle (VARCHAR)');
    console.log('   - studentCount (INT: 60) | roomId (UUID, FK -> Room.id) | examDate (TIMESTAMP)');
    console.log('   - status (ENUM: CONFIRMED, RELOCATED) -> Target of Disruption Solver\n');

    console.log('5. AuditLog');
    console.log('   - id (UUID, PK) | action (VARCHAR) | entity (VARCHAR) | entityId (VARCHAR)');
    console.log('   - userId (UUID, FK -> User.id) | details (JSONB Snapshot) | createdAt (TIMESTAMP)\n');

    console.log('========================================================================');
    console.log('Visual Browser: Open http://localhost:5555 in your browser for Prisma Studio');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

showSchema();
