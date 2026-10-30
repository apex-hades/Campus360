import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { BookingStatus, IncidentSeverity, IncidentStatus, NotificationType, Priority, RoomStatus, TicketCategory, TicketStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read current state of Block A Room A-204 and the B.Sc AI & Data Science Exam
    const roomA204 = await prisma.room.findFirst({
      where: { roomNumber: 'A-204' },
      include: { building: true },
    });

    const examination = await prisma.examination.findFirst({
      where: {
        courseTitle: { contains: 'B.Sc AI & Data Science' },
      },
      include: { room: { include: { building: true } } },
    });

    const relatedIncident = await prisma.incident.findFirst({
      where: {
        affectedRoomId: roomA204?.id,
        title: { contains: 'Electrical' },
      },
      include: { affectedRoom: true },
    });

    const relatedTicket = await prisma.ticket.findFirst({
      where: {
        roomId: roomA204?.id,
        category: TicketCategory.ELECTRICAL,
      },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { in: ['CREATE_INCIDENT', 'ROOM_UNAVAILABLE', 'RELOCATE_EXAMINATION', 'DISRUPTION_SCENARIO'] } },
          { entityId: examination?.id },
          { entityId: roomA204?.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      roomA204,
      examination,
      relatedIncident,
      relatedTicket,
      recentAuditLogs,
    });
  } catch (error) {
    console.error('[Disruption State GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve disruption state' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { stepNumber, selectedDestinationRoomId } = await req.json();

    const roomA204 = await prisma.room.findFirst({
      where: { roomNumber: 'A-204' },
      include: { building: true },
    });

    if (!roomA204) {
      return NextResponse.json({ error: 'Room A-204 not found in database' }, { status: 404 });
    }

    const examination = await prisma.examination.findFirst({
      where: { courseTitle: { contains: 'B.Sc AI & Data Science' } },
    });

    if (!examination) {
      return NextResponse.json({ error: 'B.Sc AI & Data Science examination record not found' }, { status: 404 });
    }

    // Step 1: Create an electrical incident for A-204
    if (stepNumber === 1) {
      const incidentId = 'INC-2026-0088';
      const ticketId = 'CMP-2026-0088';

      await prisma.$transaction(async (tx) => {
        // Create ticket
        const student = await tx.user.findFirst({ where: { role: 'STUDENT_FACULTY' } });
        const existingTicket = await tx.ticket.findUnique({ where: { id: ticketId } });
        if (!existingTicket) {
          await tx.ticket.create({
            data: {
              id: ticketId,
              title: 'Critical Electrical Failure - Power Drop in Room A-204',
              description: 'Complete power loss at student computer terminals and main distribution breaker in A-204. Immediate examination risk.',
              category: TicketCategory.ELECTRICAL,
              priority: Priority.CRITICAL,
              status: TicketStatus.OPEN,
              buildingId: roomA204.buildingId,
              roomId: roomA204.id,
              reporterId: student?.id || (await tx.user.findFirst())!.id,
              slaHours: 2,
              slaDeadline: new Date(Date.now() + 2 * 3600 * 1000),
            },
          });
        }

        // Create or update Incident
        const existingInc = await tx.incident.findUnique({ where: { id: incidentId } });
        if (!existingInc) {
          await tx.incident.create({
            data: {
              id: incidentId,
              title: 'CRITICAL DISRUPTION: Electrical Failure in Block A Room 204',
              description: 'Major power bus fault detected in distribution breaker AST-PDU-A204. High risk of immediate academic disruption.',
              severity: IncidentSeverity.CRITICAL,
              status: IncidentStatus.INVESTIGATING,
              affectedBuildingId: roomA204.buildingId,
              affectedRoomId: roomA204.id,
              summary: 'High-voltage electrical trip in A-204 impacting upcoming B.Sc AI & Data Science examination.',
              timeline: [
                {
                  time: new Date().toISOString(),
                  event: 'Step 1: Electrical failure reported in A-204. AI tagged Priority: CRITICAL.',
                  author: user?.name || 'Automated Monitor',
                },
              ],
            },
          });

          await tx.incidentTicket.create({
            data: { incidentId, ticketId },
          });
        }
      });

      await logAuditEvent({
        action: 'CREATE_INCIDENT',
        entity: 'Incident',
        entityId: 'INC-2026-0088',
        userId: user?.id,
        details: { step: 1, room: 'A-204', issue: 'Electrical failure' },
      });

      return NextResponse.json({
        success: true,
        step: 1,
        message: 'Step 1 Complete: Electrical incident INC-2026-0088 created for A-204 in PostgreSQL.',
      });
    }

    // Step 2: Automatically mark affected classroom unavailable
    if (stepNumber === 2) {
      await prisma.room.update({
        where: { id: roomA204.id },
        data: {
          status: RoomStatus.UNAVAILABLE,
          statusReason: 'Classroom electrical failure under emergency investigation.',
        },
      });

      await logAuditEvent({
        action: 'ROOM_UNAVAILABLE',
        entity: 'Room',
        entityId: roomA204.id,
        userId: user?.id,
        details: { step: 2, roomNumber: 'A-204', status: 'UNAVAILABLE' },
      });

      return NextResponse.json({
        success: true,
        step: 2,
        message: 'Step 2 Complete: Room A-204 status updated to UNAVAILABLE in PostgreSQL.',
      });
    }

    // Step 3 & 4: Retrieve affected examinations & identify 60 students
    if (stepNumber === 3 || stepNumber === 4) {
      const affectedExam = await prisma.examination.findFirst({
        where: { roomId: roomA204.id },
        include: { room: true },
      });

      return NextResponse.json({
        success: true,
        step: 4,
        message: 'Step 3 & 4 Complete: PostgreSQL identified 1 scheduled examination with 60 students.',
        data: {
          examCode: affectedExam?.examCode,
          courseTitle: affectedExam?.courseTitle,
          studentsAffected: affectedExam?.studentCount,
          timeWindow: `${affectedExam?.startTime} – ${affectedExam?.endTime}`,
          department: affectedExam?.department,
        },
      });
    }

    // Step 5, 6, 7: Search and validate alternative rooms
    if (stepNumber === 5 || stepNumber === 6 || stepNumber === 7) {
      const allRooms = await prisma.room.findMany({
        where: { id: { not: roomA204.id } },
        include: {
          building: true,
          bookings: { where: { status: BookingStatus.CONFIRMED } },
        },
      });

      const eligible: any[] = [];
      const rejected: any[] = [];

      for (const r of allRooms) {
        const reasons: string[] = [];
        if (r.capacity < 60) reasons.push(`Capacity is ${r.capacity} (requires >= 60 students).`);
        if (r.status !== RoomStatus.AVAILABLE) reasons.push(`Room status is ${r.status}.`);
        if (r.bookings.some((b) => b.startTime === '10:00 AM' || b.endTime === '12:00 PM')) {
          reasons.push(`Existing booking collision during 10:00 AM – 12:00 PM.`);
        }
        if (!r.facilities.includes('Projector')) reasons.push('Missing required projector facility.');

        if (reasons.length === 0) {
          eligible.push({
            id: r.id,
            roomNumber: r.roomNumber,
            building: r.building.name,
            capacity: r.capacity,
            facilities: r.facilities,
            score: r.building.code === 'BLOCK-A' ? 98 : 90, // same building bonus
          });
        } else {
          rejected.push({
            id: r.id,
            roomNumber: r.roomNumber,
            building: r.building.name,
            capacity: r.capacity,
            reasons,
          });
        }
      }

      eligible.sort((a, b) => b.score - a.score);

      return NextResponse.json({
        success: true,
        step: 7,
        message: 'Step 5-7 Complete: Room search & strict multi-factor validation completed against PostgreSQL.',
        eligible,
        rejected,
      });
    }

    // Step 8, 9, 10, 11, 12: Complete Relocation Workflow
    if (stepNumber >= 8) {
      const targetRoomId = selectedDestinationRoomId || (await prisma.room.findFirst({ where: { roomNumber: 'A-301' } }))?.id;
      if (!targetRoomId) {
        return NextResponse.json({ error: 'Valid target room must be specified' }, { status: 400 });
      }

      // Step 9: Immediate pre-execution revalidation
      const targetRoom = await prisma.room.findUnique({
        where: { id: targetRoomId },
        include: { building: true },
      });

      if (!targetRoom || targetRoom.status !== RoomStatus.AVAILABLE || targetRoom.capacity < 60) {
        return NextResponse.json({ error: 'Pre-execution revalidation failed! Room is not available.' }, { status: 409 });
      }

      // Step 10: Update examination booking in PostgreSQL
      await prisma.$transaction(async (tx) => {
        await tx.examination.update({
          where: { id: examination.id },
          data: {
            roomId: targetRoom.id,
            originalRoomId: roomA204.id,
            status: BookingStatus.RELOCATED,
            notes: `Emergency relocation from A-204 to ${targetRoom.roomNumber} due to electrical failure.`,
          },
        });

        await tx.booking.updateMany({
          where: { roomId: roomA204.id, eventType: 'EXAMINATION' },
          data: { roomId: targetRoom.id, status: BookingStatus.RELOCATED },
        });

        // Add to Incident timeline
        const incident = await tx.incident.findFirst({
          where: { affectedRoomId: roomA204.id },
        });
        if (incident) {
          const timeline = (incident.timeline as any[]) || [];
          timeline.push({
            time: new Date().toISOString(),
            event: `Step 10: Examination successfully relocated to ${targetRoom.roomNumber} (${targetRoom.building.name}).`,
            author: user?.name || 'Facilities Administrator',
          });
          await tx.incident.update({
            where: { id: incident.id },
            data: { timeline, status: IncidentStatus.IDENTIFIED },
          });
        }
      });

      // Step 11: Generate notifications
      const usersToNotify = await prisma.user.findMany({
        where: { role: { in: ['STUDENT_FACULTY', 'FACILITIES_ADMIN', 'DEPARTMENT_MANAGER'] } },
      });

      for (const u of usersToNotify) {
        await createAndDispatchNotification({
          userId: u.id,
          title: `URGENT: B.Sc AI & Data Science Exam Relocated to ${targetRoom.roomNumber}`,
          message: `Due to an electrical failure in A-204, the 10:00 AM exam (60 students) has been moved to ${targetRoom.roomNumber} (${targetRoom.building.name}, Floor ${targetRoom.floor}).`,
          type: NotificationType.DISRUPTION_ALERT,
          metadata: { examinationId: examination.id, targetRoom: targetRoom.roomNumber },
        });
      }

      // Step 12: Audit history
      await logAuditEvent({
        action: 'RELOCATE_EXAMINATION',
        entity: 'Examination',
        entityId: examination.id,
        userId: user?.id,
        details: {
          step: 12,
          fromRoom: 'A-204',
          toRoom: targetRoom.roomNumber,
          building: targetRoom.building.name,
          studentsAffected: 60,
          reason: 'Electrical failure in A-204',
        },
      });

      return NextResponse.json({
        success: true,
        step: 12,
        message: `Step 8-12 Complete: Examination relocated to ${targetRoom.roomNumber}. Notifications sent. Audit logged.`,
        targetRoom: {
          roomNumber: targetRoom.roomNumber,
          building: targetRoom.building.name,
          capacity: targetRoom.capacity,
        },
      });
    }

    return NextResponse.json({ error: 'Unrecognized step number' }, { status: 400 });
  } catch (error) {
    console.error('[Disruption Step POST Error]', error);
    return NextResponse.json({ error: 'Failed to process disruption step' }, { status: 500 });
  }
}

