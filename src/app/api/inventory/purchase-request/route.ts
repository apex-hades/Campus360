import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { ApprovalStatus, ApprovalType, NotificationType, PurchaseRequestStatus, UserRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { itemId, quantity, estimatedCost, reason } = await req.json();

    if (!itemId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Valid item and quantity are required' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const count = await prisma.purchaseRequest.count();
    const nextNum = (count + 1).toString().padStart(4, '0');
    const prId = `PR-2026-${nextNum}`;

    const cost = estimatedCost || quantity * item.unitCost;
    const requesterId = user?.id || (await prisma.user.findFirst({ where: { role: UserRole.FACILITIES_ADMIN } }))!.id;

    const { pr, approval } = await prisma.$transaction(async (tx) => {
      const createdPr = await tx.purchaseRequest.create({
        data: {
          id: prId,
          itemId,
          quantity,
          estimatedCost: cost,
          reason: reason || `Replenishment order for ${item.name}`,
          requesterId,
          status: PurchaseRequestStatus.PENDING,
        },
      });

      const createdApproval = await tx.approval.create({
        data: {
          entityType: ApprovalType.PURCHASE_REQUEST,
          entityId: createdPr.id,
          requesterId,
          status: ApprovalStatus.PENDING,
          reason: `Procurement Approval Required: ${quantity}x ${item.name} ($${cost.toFixed(2)})`,
        },
      });

      return { pr: createdPr, approval: createdApproval };
    });

    await logAuditEvent({
      action: 'CREATE_PURCHASE_REQUEST',
      entity: 'PurchaseRequest',
      entityId: pr.id,
      userId: requesterId,
      details: { item: item.name, quantity, cost, approvalId: approval.id },
    });

    // Notify Procurement Approver
    const approver = await prisma.user.findFirst({ where: { role: UserRole.PROCUREMENT_APPROVER } });
    if (approver) {
      await createAndDispatchNotification({
        userId: approver.id,
        title: `Pending Purchase Request: ${pr.id}`,
        message: `Restock request submitted for ${quantity}x ${item.name} (Estimated Total: $${cost.toFixed(2)}).`,
        type: NotificationType.APPROVAL,
        metadata: { purchaseRequestId: pr.id },
      });
    }

    return NextResponse.json({ success: true, purchaseRequest: pr, approval }, { status: 201 });
  } catch (error) {
    console.error('[Purchase Request Error]', error);
    return NextResponse.json({ error: 'Failed to create purchase request' }, { status: 500 });
  }
}

