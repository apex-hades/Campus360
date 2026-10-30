import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { calculateSlaDeadline } from '@/lib/sla';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { TicketCategory, Priority, TicketStatus, UserRole, NotificationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TicketStatus | null;
    const category = searchParams.get('category') as TicketCategory | null;
    const priority = searchParams.get('priority') as Priority | null;
    const search = searchParams.get('q');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        building: { select: { id: true, code: true, name: true } },
        room: { select: { id: true, roomNumber: true, code: true, capacity: true } },
        equipment: { select: { id: true, name: true, assetTag: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('[Tickets GET API Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();

    const {
      title,
      description,
      category = TicketCategory.OTHER,
      priority = Priority.MEDIUM,
      buildingId,
      roomId,
      equipmentId,
      affectedEquipment,
      assignedToId,
      duplicateOfId,
      attachments = [],
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Generate unique sequential ticket ID: CMP-2026-XXXX
    const count = await prisma.ticket.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    const ticketId = `CMP-2026-${nextNum}`;

    // Calculate SLA
    const { slaHours, deadline } = await calculateSlaDeadline(category, priority);

    // Initial status
    const initialStatus = assignedToId ? TicketStatus.ASSIGNED : TicketStatus.OPEN;

    // Reporter
    const reporterId = user?.id || (await prisma.user.findFirst({ where: { role: UserRole.STUDENT_FACULTY } }))?.id;
    if (!reporterId) {
      return NextResponse.json({ error: 'Valid reporter user required' }, { status: 400 });
    }

    // Atomic Prisma creation
    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.ticket.create({
        data: {
          id: ticketId,
          title,
          description,
          category,
          priority,
          status: initialStatus,
          buildingId: buildingId || null,
          roomId: roomId || null,
          equipmentId: equipmentId || null,
          affectedEquipment: affectedEquipment || null,
          reporterId,
          assignedToId: assignedToId || null,
          duplicateOfId: duplicateOfId || null,
          slaHours,
          slaDeadline: deadline,
          attachments,
        },
        include: {
          building: true,
          room: true,
          reporter: true,
          assignedTo: true,
        },
      });

      // Record ticket history
      await tx.ticketHistory.create({
        data: {
          ticketId: created.id,
          userId: reporterId,
          oldStatus: null,
          newStatus: initialStatus,
          note: 'Ticket created and entered system pipeline.',
        },
      });

      // If assigned directly, increment technician active assignments
      if (assignedToId) {
        await tx.staffProfile.updateMany({
          where: { userId: assignedToId },
          data: { activeAssignmentsCount: { increment: 1 } },
        });

        await tx.assignment.create({
          data: {
            ticketId: created.id,
            staffId: (await tx.staffProfile.findUnique({ where: { userId: assignedToId } }))!.id,
            assignedById: reporterId,
            status: 'PENDING',
            notes: `Initial auto/manual dispatch for ${created.id}`,
          },
        });
      }

      return created;
    });

    // Audit Log
    await logAuditEvent({
      action: 'CREATE_TICKET',
      entity: 'Ticket',
      entityId: ticket.id,
      userId: reporterId,
      details: {
        title: ticket.title,
        priority: ticket.priority,
        category: ticket.category,
        room: ticket.room?.roomNumber,
      },
    });

    // Notify Facilities Admin
    const facilitiesAdmin = await prisma.user.findFirst({ where: { role: UserRole.FACILITIES_ADMIN } });
    if (facilitiesAdmin) {
      await createAndDispatchNotification({
        userId: facilitiesAdmin.id,
        title: `New Ticket Filed: ${ticket.id}`,
        message: `${ticket.title} (${ticket.priority} priority in ${ticket.room?.roomNumber || 'Campus'})`,
        type: NotificationType.INCIDENT_UPDATE,
        metadata: { ticketId: ticket.id },
      });
    }

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error('[Ticket Create API Error]', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

