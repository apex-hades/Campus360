import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      usersCount,
      ticketsCount,
      incidentsCount,
      roomsCount,
      equipmentCount,
      inventoryCount,
      approvalsCount,
      auditLogsCount,
      examinationsCount,
      notificationsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
      prisma.incident.count(),
      prisma.room.count(),
      prisma.equipment.count(),
      prisma.inventoryItem.count(),
      prisma.approval.count(),
      prisma.auditLog.count(),
      prisma.examination.count(),
      prisma.notification.count(),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        users: usersCount,
        tickets: ticketsCount,
        incidents: incidentsCount,
        rooms: roomsCount,
        equipment: equipmentCount,
        inventory: inventoryCount,
        approvals: approvalsCount,
        auditLogs: auditLogsCount,
        examinations: examinationsCount,
        notifications: notificationsCount,
      },
      models: [
        { name: 'User', records: usersCount, description: 'Core authentication, roles & RBAC credentials' },
        { name: 'Ticket', records: ticketsCount, description: 'Smart operational complaints & SLA tracking' },
        { name: 'Incident', records: incidentsCount, description: 'Aggregated campus-wide multi-ticket incidents' },
        { name: 'Room', records: roomsCount, description: 'Physical facilities, capacities & operational status' },
        { name: 'Equipment', records: equipmentCount, description: 'Assets tagged with serials and health status' },
        { name: 'Examination', records: examinationsCount, description: 'High-stakes academic timetables & relocations' },
        { name: 'InventoryItem', records: inventoryCount, description: 'Warehouse parts, stock thresholds & bin locations' },
        { name: 'Approval', records: approvalsCount, description: 'Separation-of-duties governance records' },
        { name: 'Notification', records: notificationsCount, description: 'Role-targeted event dispatch queue' },
        { name: 'AuditLog', records: auditLogsCount, description: 'Append-only immutable security ledger' },
      ],
    });
  } catch (error: any) {
    console.error('Failed to query database schema statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Database statistics query failed' },
      { status: 500 }
    );
  }
}
