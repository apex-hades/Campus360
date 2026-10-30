import { prisma } from './prisma';
import { TicketCategory, Priority } from '@prisma/client';

export async function calculateSlaDeadline(category: TicketCategory, priority: Priority): Promise<{ slaHours: number; deadline: Date }> {
  const policy = await prisma.sLA.findUnique({
    where: {
      category_priority: {
        category,
        priority,
      },
    },
  });

  const hours = policy?.targetHours || (priority === Priority.CRITICAL ? 2 : priority === Priority.HIGH ? 6 : priority === Priority.MEDIUM ? 12 : 24);
  const deadline = new Date(Date.now() + hours * 3600 * 1000);

  return {
    slaHours: hours,
    deadline,
  };
}

