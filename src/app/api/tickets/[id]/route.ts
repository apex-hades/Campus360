import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true, department: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        building: true,
        room: true,
        equipment: true,
        duplicateOf: { select: { id: true, title: true, status: true, priority: true } },
        duplicates: { select: { id: true, title: true, status: true, reporter: { select: { name: true } } } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, role: true } },
          },
        },
        assignments: {
          include: {
            staff: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
            assignedBy: { select: { name: true } },
          },
        },
        incidentTickets: {
          include: {
            incident: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('[Ticket Detail API Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve ticket details' }, { status: 500 });
  }
}

