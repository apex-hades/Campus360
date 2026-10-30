import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus, RoomStatus } from '@prisma/client';

export interface EvaluatedRoom {
  id: string;
  roomNumber: string;
  code: string;
  buildingName: string;
  buildingCode: string;
  capacity: number;
  roomType: string;
  facilities: string[];
  status: RoomStatus;
  matchScore: number;
  eligibilityNotes: string[];
}

export interface RejectedRoom {
  id: string;
  roomNumber: string;
  code: string;
  buildingName: string;
  capacity: number;
  reasons: string[];
}

export async function POST(req: NextRequest) {
  try {
    const {
      excludeRoomId,
      requiredCapacity = 60,
      startTime = '10:00 AM',
      endTime = '12:00 PM',
      requiredFacilities = ['Projector'],
      targetDate,
    } = await req.json();

    const date = targetDate ? new Date(targetDate) : new Date();
    date.setHours(0, 0, 0, 0);

    // Fetch all other campus rooms
    const allRooms = await prisma.room.findMany({
      where: {
        id: excludeRoomId ? { not: excludeRoomId } : undefined,
      },
      include: {
        building: true,
        bookings: {
          where: {
            date,
            status: BookingStatus.CONFIRMED,
          },
        },
        examinations: {
          where: {
            examDate: date,
            status: BookingStatus.CONFIRMED,
          },
        },
      },
      orderBy: [{ building: { code: 'asc' } }, { capacity: 'desc' }],
    });

    const eligibleRooms: EvaluatedRoom[] = [];
    const rejectedRooms: RejectedRoom[] = [];

    for (const room of allRooms) {
      const reasons: string[] = [];
      const eligibilityNotes: string[] = [];
      let matchScore = 100;

      // 1. Capacity Check
      if (room.capacity < requiredCapacity) {
        reasons.push(`Insufficient capacity: accommodates ${room.capacity} students (required: ${requiredCapacity}).`);
      } else {
        const excess = room.capacity - requiredCapacity;
        eligibilityNotes.push(`Sufficient capacity: ${room.capacity} seats (${excess} buffer seats).`);
        if (excess <= 25) matchScore += 10; // optimal fit
      }

      // 2. Room Status Check
      if (room.status === RoomStatus.UNAVAILABLE || room.status === RoomStatus.MAINTENANCE) {
        reasons.push(`Room status is currently ${room.status}.`);
      }

      // 3. Time Conflict Check against existing bookings
      const hasBookingConflict = room.bookings.some((b) => {
        // Compare time slots
        return b.startTime === startTime || b.endTime === endTime;
      });

      const hasExamConflict = room.examinations.some((e) => {
        return e.startTime === startTime || e.endTime === endTime;
      });

      if (hasBookingConflict || hasExamConflict) {
        reasons.push(`Schedule collision: Room is already booked during ${startTime} – ${endTime}.`);
      } else {
        eligibilityNotes.push(`Zero timetable conflicts during ${startTime} – ${endTime}.`);
      }

      // 4. Required Facilities Check
      const missingFacilities = requiredFacilities.filter((reqFac: string) =>
        !room.facilities.some((f) => f.toLowerCase().includes(reqFac.toLowerCase()))
      );

      if (missingFacilities.length > 0) {
        reasons.push(`Missing mandatory facilities: ${missingFacilities.join(', ')}.`);
      } else {
        eligibilityNotes.push(`Verified all required facilities (${requiredFacilities.join(', ')}).`);
      }

      // Categorize into eligible or rejected
      if (reasons.length === 0) {
        eligibleRooms.push({
          id: room.id,
          roomNumber: room.roomNumber,
          code: room.code,
          buildingName: room.building.name,
          buildingCode: room.building.code,
          capacity: room.capacity,
          roomType: room.roomType,
          facilities: room.facilities,
          status: room.status,
          matchScore,
          eligibilityNotes,
        });
      } else {
        rejectedRooms.push({
          id: room.id,
          roomNumber: room.roomNumber,
          code: room.code,
          buildingName: room.building.name,
          capacity: room.capacity,
          reasons,
        });
      }
    }

    // Sort eligible by highest match score
    eligibleRooms.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      eligibleRooms,
      rejectedRooms,
      totalEvaluated: allRooms.length,
    });
  } catch (error) {
    console.error('[Check Alternatives Error]', error);
    return NextResponse.json({ error: 'Failed to evaluate alternative rooms' }, { status: 500 });
  }
}

