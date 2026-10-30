import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { IncidentStatus } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        affectedBuilding: true,
        affectedRoom: {
          include: {
            examinations: true,
            bookings: true,
          },
        },
        tickets: {
          include: {
            ticket: {
              include: {
                reporter: { select: { name: true, email: true } },
                assignedTo: { select: { name: true } },
              },
            },
          },
        },
        assignments: {
          include: {
            staff: {
              include: { user: { select: { id: true, name: true, email: true, phone: true } } },
            },
          },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ incident });
  } catch (error) {
    console.error('[Incident Detail Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve incident details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    const { id } = params;
    const { status, timelineNote, linkTicketId, leadTechnicianId } = await req.json();

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const currentTimeline = (incident.timeline as any[]) || [];
    const updatedTimeline = [...currentTimeline];

    if (timelineNote) {
      updatedTimeline.push({
        time: new Date().toISOString(),
        event: timelineNote,
        author: user?.name || 'Administrator',
      });
    }

    const updateData: any = {
      timeline: updatedTimeline,
    };

    if (status && Object.values(IncidentStatus).includes(status)) {
      updateData.status = status;
      if (status === IncidentStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      }
      updatedTimeline.push({
        time: new Date().toISOString(),
        event: `Incident status updated to ${status}.`,
        author: user?.name || 'Administrator',
      });
    }

    if (leadTechnicianId) {
      updateData.leadTechnicianId = leadTechnicianId;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inc = await tx.incident.update({
        where: { id },
        data: updateData,
      });

      if (linkTicketId) {
        await tx.incidentTicket.create({
          data: {
            incidentId: id,
            ticketId: linkTicketId,
          },
        });
      }

      return inc;
    });

    await logAuditEvent({
      action: 'UPDATE_INCIDENT',
      entity: 'Incident',
      entityId: id,
      userId: user?.id,
      details: { status, timelineNote, linkTicketId },
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (error) {
    console.error('[Update Incident Error]', error);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}

