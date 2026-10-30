import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all' or 'unread'

    const where: any = {};
    if (user) {
      where.userId = user.id;
    }
    if (filter === 'unread') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...(user ? { userId: user.id } : {}),
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('[Notifications GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { notificationId, markAll = false } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: user ? { userId: user.id, read: false } : { read: false },
        data: { read: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('[Notifications PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

