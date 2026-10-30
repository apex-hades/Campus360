import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, RoomStatus } from '@prisma/client';

export async function POST() {
  try {
    const roomA204 = await prisma.room.findFirst({
      where: { roomNumber: 'A-204' },
    });

    if (roomA204) {
      // Reset A-204 status to AVAILABLE
      await prisma.room.update({
        where: { id: roomA204.id },
        data: {
          status: RoomStatus.AVAILABLE,
          statusReason: null,
        },
      });

      // Reset Examination back to A-204
      await prisma.examination.updateMany({
        where: { courseTitle: { contains: 'B.Sc AI & Data Science' } },
        data: {
          roomId: roomA204.id,
          originalRoomId: null,
          status: BookingStatus.CONFIRMED,
          notes: 'Mandatory high-stakes semester final exam for 60 undergraduate students.',
        },
      });

      // Reset Bookings
      await prisma.booking.updateMany({
        where: { title: { contains: 'B.Sc AI & Data Science' } },
        data: {
          roomId: roomA204.id,
          status: BookingStatus.CONFIRMED,
        },
      });

      // Remove scenario incident & ticket
      await prisma.incidentTicket.deleteMany({
        where: { incidentId: 'INC-2026-0088' },
      });
      await prisma.incident.deleteMany({
        where: { id: 'INC-2026-0088' },
      });
      await prisma.ticketComment.deleteMany({
        where: { ticketId: 'CMP-2026-0088' },
      });
      await prisma.ticketHistory.deleteMany({
        where: { ticketId: 'CMP-2026-0088' },
      });
      await prisma.ticket.deleteMany({
        where: { id: 'CMP-2026-0088' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Disruption demonstration scenario successfully reset to initial state!',
    });
  } catch (error) {
    console.error('[Scenario Reset Error]', error);
    return NextResponse.json({ error: 'Failed to reset scenario' }, { status: 500 });
  }
}

