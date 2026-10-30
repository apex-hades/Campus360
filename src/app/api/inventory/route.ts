import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { StockStatus, TicketCategory, TicketStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as TicketCategory | null;
    const status = searchParams.get('status') as StockStatus | null;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: [{ status: 'asc' }, { quantity: 'asc' }],
      include: {
        reservations: {
          where: { status: 'RESERVED' },
          include: { ticket: { select: { id: true, title: true } } },
        },
        purchaseRequests: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
    });

    const lowStockCount = await prisma.inventoryItem.count({
      where: { status: { in: [StockStatus.LOW_STOCK, StockStatus.OUT_OF_STOCK] } },
    });

    return NextResponse.json({ items, lowStockCount });
  } catch (error) {
    console.error('[Inventory GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve inventory items' }, { status: 500 });
  }
}

// Adjust stock level (add or consume)
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { itemId, changeAmount, ticketId, reason } = await req.json();

    if (!itemId || changeAmount === undefined) {
      return NextResponse.json({ error: 'Item ID and change amount are required' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const newQuantity = item.quantity + changeAmount;

    // SECTION 10 REQUIREMENT: "Prevent negative inventory through backend validation and database transactions."
    if (newQuantity < 0) {
      return NextResponse.json(
        {
          error: `Transaction rejected: Negative stock is prohibited. Available: ${item.quantity}, Requested reduction: ${Math.abs(changeAmount)}.`,
        },
        { status: 400 }
      );
    }

    // Determine new status
    let newStatus: StockStatus = StockStatus.IN_STOCK;
    if (newQuantity === 0) {
      newStatus = StockStatus.OUT_OF_STOCK;
    } else if (newQuantity <= item.minStockThreshold) {
      newStatus = StockStatus.LOW_STOCK;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          quantity: newQuantity,
          status: newStatus,
        },
      });

      // SECTION 10 REQUIREMENT: "If required stock is unavailable, mark the associated work order as BLOCKED."
      if (ticketId && newQuantity === 0) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            status: TicketStatus.BLOCKED,
            blockedReason: `Awaiting spare part replenishment: ${item.name} (${item.sku}) is currently OUT OF STOCK.`,
          },
        });

        await tx.ticketHistory.create({
          data: {
            ticketId,
            userId: user?.id,
            oldStatus: null,
            newStatus: TicketStatus.BLOCKED,
            note: `Auto-blocked: Component ${item.name} out of stock.`,
          },
        });
      }

      return updated;
    });

    await logAuditEvent({
      action: 'UPDATE_INVENTORY_STOCK',
      entity: 'InventoryItem',
      entityId: itemId,
      userId: user?.id,
      details: {
        item: item.name,
        previousQuantity: item.quantity,
        newQuantity,
        changeAmount,
        reason,
      },
    });

    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    console.error('[Update Inventory Stock Error]', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}

