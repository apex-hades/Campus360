import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { TicketStatus, NotificationType } from '@prisma/client';

// Allowed state transitions map
const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.TRIAGED, TicketStatus.ASSIGNED, TicketStatus.BLOCKED],
  [TicketStatus.TRIAGED]: [TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.BLOCKED],
  [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS, TicketStatus.BLOCKED, TicketStatus.TRIAGED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.BLOCKED, TicketStatus.ASSIGNED],
  [TicketStatus.BLOCKED]: [TicketStatus.IN_PROGRESS, TicketStatus.ASSIGNED, TicketStatus.TRIAGED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.REOPENED],
  [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
  [TicketStatus.REOPENED]: [TicketStatus.IN_PROGRESS, TicketStatus.ASSIGNED, TicketStatus.TRIAGED],
};

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    const { id } = params;
    const { newStatus, note, blockedReason } = await req.json();

    if (!newStatus || !Object.values(TicketStatus).includes(newStatus)) {
      return NextResponse.json({ error: 'Valid new status is required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { reporter: true, assignedTo: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const currentStatus = ticket.status;

    // Validate transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus) && currentStatus !== newStatus) {
      return NextResponse.json(
        {
          error: `Invalid status transition: Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const resolvedAt = newStatus === TicketStatus.RESOLVED || newStatus === TicketStatus.CLOSED ? new Date() : null;

    // Execute atomic update
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: { id },
        data: {
          status: newStatus,
          blockedReason: newStatus === TicketStatus.BLOCKED ? (blockedReason || note || 'Resource unavailable') : null,
          resolvedAt: resolvedAt || (newStatus === TicketStatus.REOPENED ? null : ticket.resolvedAt),
        },
      });

      // Record History
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          userId: user?.id || null,
          oldStatus: currentStatus,
          newStatus,
          note: note || (newStatus === TicketStatus.BLOCKED ? `Blocked: ${blockedReason}` : `Status transitioned to ${newStatus}`),
        },
      });

      // If resolved or closed, decrement assigned technician's active count
      if ((newStatus === TicketStatus.RESOLVED || newStatus === TicketStatus.CLOSED) && ticket.assignedToId) {
        await tx.staffProfile.updateMany({
          where: { userId: ticket.assignedToId, activeAssignmentsCount: { gt: 0 } },
          data: { activeAssignmentsCount: { decrement: 1 } },
        });
      }

      return updated;
    });

    // Log Audit Event
    await logAuditEvent({
      action: 'UPDATE_TICKET_STATUS',
      entity: 'Ticket',
      entityId: id,
      userId: user?.id,
      details: {
        from: currentStatus,
        to: newStatus,
        note,
      },
    });

    // Notify Reporter of status change
    if (ticket.reporterId) {
      await createAndDispatchNotification({
        userId: ticket.reporterId,
        title: `Ticket ${ticket.id} Update: ${newStatus}`,
        message: `Your ticket "${ticket.title}" status changed to ${newStatus}. Note: ${note || 'No additional notes'}`,
        type: NotificationType.INCIDENT_UPDATE,
        metadata: { ticketId: id, status: newStatus },
      });
    }

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('[Ticket Status Transition Error]', error);
    return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 });
  }
}

