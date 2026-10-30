import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { TicketStatus, NotificationType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    const { id } = params;
    const { technicianId, notes } = await req.json();

    if (!technicianId) {
      return NextResponse.json({ error: 'Technician ID is required' }, { status: 400 });
    }

    // Verify staff availability
    const staff = await prisma.staffProfile.findUnique({
      where: { userId: technicianId },
      include: { user: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Selected technician profile not found' }, { status: 404 });
    }

    if (!staff.isAvailable) {
      return NextResponse.json({ error: `${staff.user.name} is currently marked unavailable (off-shift or leave).` }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const previousAssigneeId = ticket.assignedToId;

    await prisma.$transaction(async (tx) => {
      // Update ticket
      await tx.ticket.update({
        where: { id },
        data: {
          assignedToId: technicianId,
          status: ticket.status === TicketStatus.OPEN ? TicketStatus.ASSIGNED : ticket.status,
        },
      });

      // Update old staff count
      if (previousAssigneeId && previousAssigneeId !== technicianId) {
        await tx.staffProfile.updateMany({
          where: { userId: previousAssigneeId, activeAssignmentsCount: { gt: 0 } },
          data: { activeAssignmentsCount: { decrement: 1 } },
        });
      }

      // Update new staff count
      await tx.staffProfile.update({
        where: { id: staff.id },
        data: { activeAssignmentsCount: { increment: 1 } },
      });

      // Record Assignment
      await tx.assignment.create({
        data: {
          ticketId: id,
          staffId: staff.id,
          assignedById: user?.id || technicianId,
          status: 'PENDING',
          notes: notes || `Assigned to ${staff.user.name}`,
        },
      });

      // Ticket history
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          userId: user?.id,
          oldStatus: ticket.status,
          newStatus: ticket.status === TicketStatus.OPEN ? TicketStatus.ASSIGNED : ticket.status,
          note: `Assigned to ${staff.user.name}. ${notes || ''}`,
        },
      });
    });

    // Audit log
    await logAuditEvent({
      action: 'ASSIGN_TICKET',
      entity: 'Ticket',
      entityId: id,
      userId: user?.id,
      details: {
        assignedTo: staff.user.name,
        technicianId,
        notes,
      },
    });

    // Notify technician
    await createAndDispatchNotification({
      userId: technicianId,
      title: `Work Order Assigned: ${ticket.id}`,
      message: `You have been assigned to: "${ticket.title}". Priority: ${ticket.priority}.`,
      type: NotificationType.ASSIGNMENT,
      metadata: { ticketId: id },
    });

    return NextResponse.json({ success: true, message: `Ticket assigned to ${staff.user.name}` });
  } catch (error) {
    console.error('[Assign Ticket Error]', error);
    return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
  }
}

