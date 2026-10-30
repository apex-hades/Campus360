import { prisma } from './prisma';

export async function logAuditEvent({
  action,
  entity,
  entityId,
  userId,
  ipAddress = '127.0.0.1',
  details,
}: {
  action: string;
  entity: string;
  entityId: string;
  userId?: string | null;
  ipAddress?: string;
  details: Record<string, any>;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: userId || null,
        ipAddress,
        details,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error]', error);
  }
}

