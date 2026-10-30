import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { createAndDispatchNotification } from '@/lib/webhook';
import { ApprovalStatus, ApprovalType, NotificationType, PurchaseRequestStatus, StockStatus, UserRole } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticateRequest(req);
    const { id } = params;
    const { action, comments } = await req.json(); // action: 'APPROVE' | 'REJECT'

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Action must be APPROVE or REJECT' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Sign in required.' }, { status: 401 });
    }

    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { requester: true },
    });

    if (!approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      return NextResponse.json({ error: `Approval already decided (${approval.status})` }, { status: 400 });
    }

    // SECTION 11 REQUIREMENT: "Prevent users from approving their own requests where separation of duties applies."
    if (user.id === approval.requesterId && user.role !== UserRole.SYSTEM_ADMIN) {
      return NextResponse.json(
        {
          error: 'Separation of Duties Policy: You cannot approve or override a request that you submitted.',
        },
        { status: 403 }
      );
    }

    // Role check by entity type
    if (approval.entityType === ApprovalType.PURCHASE_REQUEST) {
      if (user.role !== UserRole.PROCUREMENT_APPROVER && user.role !== UserRole.SYSTEM_ADMIN) {
        return NextResponse.json({ error: 'Purchase requests require Procurement Approver role.' }, { status: 403 });
      }
    } else if (approval.entityType === ApprovalType.ROOM_RELOCATION) {
      if (user.role !== UserRole.FACILITIES_ADMIN && user.role !== UserRole.SYSTEM_ADMIN) {
        return NextResponse.json({ error: 'Room relocations require Facilities Administrator role.' }, { status: 403 });
      }
    }

    const newApprovalStatus = action === 'APPROVE' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Approval record
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          status: newApprovalStatus,
          approverId: user.id,
          comments: comments || (action === 'APPROVE' ? 'Approved by authorized officer.' : 'Rejected by reviewer.'),
          decidedAt: new Date(),
          revalidationData: {
            decidedByRole: user.role,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // 2. Execute underlying operation if approved
      if (approval.entityType === ApprovalType.PURCHASE_REQUEST) {
        const pr = await tx.purchaseRequest.findUnique({
          where: { id: approval.entityId },
          include: { item: true },
        });

        if (pr) {
          const prStatus = action === 'APPROVE' ? PurchaseRequestStatus.APPROVED : PurchaseRequestStatus.REJECTED;
          await tx.purchaseRequest.update({
            where: { id: pr.id },
            data: {
              status: prStatus,
              approverId: user.id,
              approvedAt: new Date(),
              comments,
            },
          });

          // If approved, restock inventory quantity
          if (action === 'APPROVE') {
            const updatedQty = pr.item.quantity + pr.quantity;
            let stockStatus: StockStatus = StockStatus.IN_STOCK;
            if (updatedQty === 0) stockStatus = StockStatus.OUT_OF_STOCK;
            else if (updatedQty <= pr.item.minStockThreshold) stockStatus = StockStatus.LOW_STOCK;

            await tx.inventoryItem.update({
              where: { id: pr.itemId },
              data: {
                quantity: updatedQty,
                status: stockStatus,
              },
            });
          }
        }
      }

      return updatedApproval;
    });

    await logAuditEvent({
      action: action === 'APPROVE' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      entity: 'Approval',
      entityId: id,
      userId: user.id,
      details: {
        entityType: approval.entityType,
        entityId: approval.entityId,
        decision: action,
        comments,
      },
    });

    // Notify requester
    await createAndDispatchNotification({
      userId: approval.requesterId,
      title: `Approval Request ${action}: ${approval.entityType}`,
      message: `${user.name} has ${action.toLowerCase()}d your ${approval.entityType.replace('_', ' ')} request. Reason: ${comments || 'No comment provided.'}`,
      type: NotificationType.APPROVAL,
      metadata: { approvalId: id, status: newApprovalStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Request successfully ${action.toLowerCase()}d`,
      approval: result,
    });
  } catch (error) {
    console.error('[Approval Action Error]', error);
    return NextResponse.json({ error: 'Failed to execute approval decision' }, { status: 500 });
  }
}

