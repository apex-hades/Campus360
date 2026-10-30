import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as IncidentStatus | null;
    const severity = searchParams.get('severity') as IncidentSeverity | null;

    const where: any = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        affectedBuilding: { select: { id: true, code: true, name: true } },
        affectedRoom: { select: { id: true, roomNumber: true, code: true, capacity: true } },
        tickets: {
          include: {
            ticket: {
              select: { id: true, title: true, priority: true, status: true, category: true, createdAt: true },
            },
          },
        },
        assignments: {
          include: {
            staff: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('[Incidents GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve campus incidents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();

    const {
      title,
      description,
      severity = IncidentSeverity.HIGH,
      affectedBuildingId,
      affectedRoomId,
      ticketIds = [],
      summary,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const count = await prisma.incident.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    const incidentId = `INC-2026-${nextNum}`;

    const timeline = [
      {
        time: new Date().toISOString(),
        event: 'Incident officially declared and intelligence record created.',
        author: user?.name || 'System Operator',
      },
    ];

    const incident = await prisma.$transaction(async (tx) => {
      const inc = await tx.incident.create({
        data: {
          id: incidentId,
          title,
          description,
          severity,
          status: IncidentStatus.INVESTIGATING,
          affectedBuildingId: affectedBuildingId || null,
          affectedRoomId: affectedRoomId || null,
          summary: summary || title,
          timeline,
        },
        include: {
          affectedBuilding: true,
          affectedRoom: true,
        },
      });

      // Link any existing tickets
      for (const tId of ticketIds) {
        await tx.incidentTicket.create({
          data: {
            incidentId: inc.id,
            ticketId: tId,
          },
        });
      }

      return inc;
    });

    await logAuditEvent({
      action: 'CREATE_INCIDENT',
      entity: 'Incident',
      entityId: incident.id,
      userId: user?.id,
      details: { title, severity, building: affectedBuildingId, room: affectedRoomId },
    });

    return NextResponse.json({ success: true, incident }, { status: 201 });
  } catch (error) {
    console.error('[Create Incident Error]', error);
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}

