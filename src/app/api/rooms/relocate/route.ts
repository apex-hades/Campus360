import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { BookingStatus, NotificationType, RoomStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const {
      examinationId,
      bookingId,
      originalRoomId,
      targetRoomId,
      reason = 'Classroom electrical emergency relocation prior to examination.',
      startTime = '10:00 AM',
      endTime = '12:00 PM',
    } = await req.json();

    if (!targetRoomId || (!examinationId && !bookingId)) {
      return NextResponse.json({ error: 'Target room ID and examination or booking ID are required' }, { status: 400 });
    }

    // STEP 9: Revalidate room availability immediately before approval execution (Concurrency Check)
    const targetRoom = await prisma.room.findUnique({
      where: { id: targetRoomId },
      include: {
        building: true,
        bookings: {
          where: {
            status: BookingStatus.CONFIRMED,
            OR: [
              { startTime: { lte: startTime }, endTime: { gt: startTime } },
              { startTime: { lt: endTime }, endTime: { gte: endTime } },
            ],
          },
        },
      },
    });

    if (!targetRoom) {
      return NextResponse.json({ error: 'Target destination room does not exist' }, { status: 404 });
    }

    if (targetRoom.status === RoomStatus.UNAVAILABLE || targetRoom.status === RoomStatus.MAINTENANCE) {
      return NextResponse.json(
        { error: `Pre-execution revalidation failed: Room ${targetRoom.roomNumber} status is ${targetRoom.status}.` },
        { status: 409 }
      );
    }

    if (targetRoom.bookings.length > 0) {
      return NextResponse.json(
        {
          error: `Pre-execution revalidation failed: Room ${targetRoom.roomNumber} has a conflicting reservation during this timeframe.`,
        },
        { status: 409 }
      );
    }

    // Retrieve original room info
    const originalRoom = originalRoomId ? await prisma.room.findUnique({ where: { id: originalRoomId } }) : null;

    // STEP 10: Atomic PostgreSQL transaction execution
    const result = await prisma.$transaction(async (tx) => {
      let examRecord = null;
      if (examinationId) {
        examRecord = await tx.examination.update({
          where: { id: examinationId },
          data: {
            roomId: targetRoomId,
            originalRoomId: originalRoomId || undefined,
            status: BookingStatus.RELOCATED,
            notes: `Relocated from ${originalRoom?.roomNumber || 'Original Room'} to ${targetRoom.roomNumber} due to: ${reason}`,
          },
        });
      }

      // Update associated booking
      if (bookingId) {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            roomId: targetRoomId,
            status: BookingStatus.RELOCATED,
          },
        });
      } else if (originalRoomId) {
        await tx.booking.updateMany({
          where: {
            roomId: originalRoomId,
            status: BookingStatus.CONFIRMED,
          },
          data: {
            roomId: targetRoomId,
            status: BookingStatus.RELOCATED,
          },
        });
      }

      // If original room was affected, ensure it stays marked UNAVAILABLE
      if (originalRoomId) {
        await tx.room.update({
          where: { id: originalRoomId },
          data: {
            status: RoomStatus.UNAVAILABLE,
            statusReason: `Emergency disruption: ${reason}`,
          },
        });
      }

      return { examRecord, targetRoom };
    });

    // STEP 11: Generate notifications for affected students, faculty, and administrators
    const studentCount = result.examRecord?.studentCount || 60;
    const examName = result.examRecord?.courseTitle || 'B.Sc AI & Data Science Examination';

    const usersToNotify = await prisma.user.findMany({
      where: {
        role: { in: ['STUDENT_FACULTY', 'FACILITIES_ADMIN', 'DEPARTMENT_MANAGER'] },
      },
    });

    for (const u of usersToNotify) {
      await createAndDispatchNotification({
        userId: u.id,
        title: `URGENT RELOCATION: ${examName}`,
        message: `Examination for ${studentCount} students originally in ${originalRoom?.roomNumber || 'A-204'} has been relocated to ${targetRoom.roomNumber} (${targetRoom.building.name}, Floor ${targetRoom.floor}). Time remains ${startTime} - ${endTime}.`,
        type: NotificationType.DISRUPTION_ALERT,
        metadata: {
          examinationId,
          originalRoom: originalRoom?.roomNumber,
          newRoom: targetRoom.roomNumber,
          studentCount,
        },
      });
    }

    // STEP 12: Record every operation in PostgreSQL Audit History
    await logAuditEvent({
      action: 'RELOCATE_EXAMINATION',
      entity: 'Examination',
      entityId: examinationId || 'EXAM-RELOC',
      userId: user?.id,
      details: {
        examination: examName,
        studentsAffected: studentCount,
        fromRoom: originalRoom?.roomNumber,
        toRoom: targetRoom.roomNumber,
        building: targetRoom.building.name,
        reason,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Examination successfully relocated to ${targetRoom.roomNumber}!`,
      destinationRoom: {
        id: targetRoom.id,
        roomNumber: targetRoom.roomNumber,
        building: targetRoom.building.name,
        capacity: targetRoom.capacity,
      },
    });
  } catch (error) {
    console.error('[Relocate Room Error]', error);
    return NextResponse.json({ error: 'Failed to execute room relocation' }, { status: 500 });
  }
}

