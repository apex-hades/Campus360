import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { BookingStatus, EventType, RoomStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get('buildingId');
    const minCapacity = searchParams.get('minCapacity');
    const status = searchParams.get('status') as RoomStatus | null;

    const where: any = {};
    if (buildingId) where.buildingId = buildingId;
    if (minCapacity) where.capacity = { gte: parseInt(minCapacity, 10) };
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      orderBy: [{ building: { code: 'asc' } }, { roomNumber: 'asc' }],
      include: {
        building: true,
        equipment: {
          select: { id: true, name: true, assetTag: true, status: true, category: true },
        },
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          orderBy: { startTime: 'asc' },
          take: 5,
        },
        examinations: {
          where: { status: BookingStatus.CONFIRMED },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('[Rooms GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve campus rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const body = await req.json();

    const {
      roomId,
      title,
      eventType = EventType.CLASS,
      date,
      startTime,
      endTime,
      requiredCapacity = 0,
    } = body;

    if (!roomId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Room ID, title, start time and end time are required' }, { status: 400 });
    }

    const bookingDate = date ? new Date(date) : new Date();
    bookingDate.setHours(0, 0, 0, 0);

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status === RoomStatus.UNAVAILABLE || room.status === RoomStatus.MAINTENANCE) {
      return NextResponse.json({ error: `Room ${room.roomNumber} is currently unavailable due to maintenance.` }, { status: 400 });
    }

    if (requiredCapacity > 0 && room.capacity < requiredCapacity) {
      return NextResponse.json({ error: `Room capacity (${room.capacity}) is less than required (${requiredCapacity})` }, { status: 400 });
    }

    // Atomic double-booking conflict prevention
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        date: bookingDate,
        status: BookingStatus.CONFIRMED,
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          error: `Time conflict detected: Room ${room.roomNumber} is already booked for "${existingBooking.title}" during ${existingBooking.startTime} - ${existingBooking.endTime}.`,
        },
        { status: 409 }
      );
    }

    const bookedById = user?.id || (await prisma.user.findFirst())!.id;

    const booking = await prisma.booking.create({
      data: {
        roomId,
        title,
        bookedById,
        eventType,
        date: bookingDate,
        startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
      },
    });

    await logAuditEvent({
      action: 'CREATE_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      userId: user?.id,
      details: { room: room.roomNumber, title, startTime, endTime },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('[Create Booking Error]', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

