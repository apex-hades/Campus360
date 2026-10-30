import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { ApprovalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as ApprovalStatus | null;

    const where: any = {};
    if (status) where.status = status;

    const approvals = await prisma.approval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        approver: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    const pendingCount = await prisma.approval.count({
      where: { status: ApprovalStatus.PENDING },
    });

    return NextResponse.json({ approvals, pendingCount });
  } catch (error) {
    console.error('[Approvals GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve approval records' }, { status: 500 });
  }
}

