import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  try {
    const staff = await prisma.staffProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, department: true },
        },
        assignments: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
          include: {
            ticket: { select: { id: true, title: true, priority: true, category: true, status: true } },
          },
        },
      },
      orderBy: [{ isAvailable: 'desc' }, { activeAssignmentsCount: 'asc' }],
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error('[Staff GET Error]', error);
    return NextResponse.json({ error: 'Failed to retrieve staff workforce' }, { status: 500 });
  }
}

// Smart auto-assignment recommendation endpoint
export async function POST(req: NextRequest) {
  try {
    const { category, priority, requiredSkills = [] } = await req.json();

    // Query all available technicians
    const technicians = await prisma.staffProfile.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    if (technicians.length === 0) {
      return NextResponse.json({
        recommendation: null,
        message: 'No available technicians on shift currently.',
      });
    }

    // Rank technicians:
    // 1. Skill match (+30 points per matching skill or category)
    // 2. Workload capacity (fewer active tickets = higher score)
    // 3. Under max concurrent limit
    const scored = technicians
      .filter((t) => t.activeAssignmentsCount < t.maxConcurrentTickets)
      .map((t) => {
        let score = 50;
        const skillsLower = t.skills.map((s) => s.toLowerCase());

        // Category match
        if (category && skillsLower.some((s) => s.includes(category.toLowerCase().replace('_', ' ')))) {
          score += 40;
        }

        // Required skills match
        for (const reqSkill of requiredSkills) {
          if (skillsLower.some((s) => s.includes(reqSkill.toLowerCase()))) {
            score += 25;
          }
        }

        // Workload penalty (less busy is better)
        score -= t.activeAssignmentsCount * 12;

        return {
          staff: t,
          score,
          reasons: [
            `${t.activeAssignmentsCount}/${t.maxConcurrentTickets} active tasks`,
            `Specialized in: ${t.skills.join(', ')}`,
          ],
        };
      });

    scored.sort((a, b) => b.score - a.score);

    const bestMatch = scored[0] || null;

    return NextResponse.json({
      success: true,
      recommendation: bestMatch ? bestMatch.staff : null,
      score: bestMatch ? bestMatch.score : 0,
      candidates: scored,
    });
  } catch (error) {
    console.error('[Staff Recommendation Error]', error);
    return NextResponse.json({ error: 'Failed to compute technician recommendation' }, { status: 500 });
  }
}

// Update availability or shift
export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { staffId, isAvailable, shift } = await req.json();

    const updated = await prisma.staffProfile.update({
      where: { id: staffId },
      data: {
        isAvailable: isAvailable !== undefined ? isAvailable : undefined,
        shift: shift !== undefined ? shift : undefined,
      },
      include: { user: true },
    });

    await logAuditEvent({
      action: 'UPDATE_STAFF_STATUS',
      entity: 'StaffProfile',
      entityId: staffId,
      userId: user?.id,
      details: { staffName: updated.user.name, isAvailable, shift },
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error) {
    console.error('[Update Staff Error]', error);
    return NextResponse.json({ error: 'Failed to update technician status' }, { status: 500 });
  }
}

