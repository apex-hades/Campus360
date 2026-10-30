import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { createAndDispatchNotification } from '@/lib/webhook';
import { NotificationType, UserRole } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    const { id } = params;
    const { message, isInternal = false } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const userId = user?.id || (await prisma.user.findFirst({ where: { role: UserRole.STUDENT_FACULTY } }))?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User must be authenticated to comment' }, { status: 401 });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        userId,
        message,
        isInternal,
      },
      include: {
        user: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    // Notify assigned technician or reporter
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { reporterId: true, assignedToId: true, title: true },
    });

    if (ticket) {
      const recipientId = userId === ticket.reporterId ? ticket.assignedToId : ticket.reporterId;
      if (recipientId && (!isInternal || recipientId !== ticket.reporterId)) {
        await createAndDispatchNotification({
          userId: recipientId,
          title: `New Comment on Ticket ${id}`,
          message: `${comment.user.name}: "${message.slice(0, 100)}..."`,
          type: NotificationType.INCIDENT_UPDATE,
          metadata: { ticketId: id },
        });
      }
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('[Add Comment Error]', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

