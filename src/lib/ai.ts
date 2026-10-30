import { z } from 'zod';
import { prisma } from './prisma';
import { TicketCategory, Priority, TicketStatus } from '@prisma/client';
import Groq from 'groq-sdk';

// Zod Schema for strict structured NLP extraction
export const ComplaintAnalysisSchema = z.object({
  category: z.nativeEnum(TicketCategory),
  buildingCode: z.string().nullable(),
  roomNumber: z.string().nullable(),
  equipmentName: z.string().nullable(),
  priority: z.nativeEnum(Priority),
  urgencyReason: z.string(),
  summary: z.string(),
  missingInformation: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
  isDisruptionRisk: z.boolean(),
  confidenceScore: z.number().min(0).max(1),
  engine: z.string(),
});

export type ComplaintAnalysis = z.infer<typeof ComplaintAnalysisSchema>;

export interface VerifiedIncidentEntities {
  analysis: ComplaintAnalysis;
  verifiedBuilding: { id: string; code: string; name: string } | null;
  verifiedRoom: { id: string; roomNumber: string; capacity: number; status: string } | null;
  verifiedEquipment: { id: string; name: string; assetTag: string } | null;
  duplicateCandidate: { id: string; title: string; status: string; priority: string } | null;
  affectedSchedule: { title: string; studentCount?: number; startTime: string; endTime: string } | null;
}

// Heuristic fallback processor (deterministic, fast, zero network dependency)
export function analyzeComplaintHeuristically(text: string): ComplaintAnalysis {
  const lower = text.toLowerCase();

  // 1. Category extraction
  let category: TicketCategory = TicketCategory.OTHER;
  if (lower.includes('projector') || lower.includes('mic') || lower.includes('podium') || lower.includes('screen') || lower.includes('hdmi') || lower.includes('audio') || lower.includes('speaker') || lower.includes('terminal')) {
    category = TicketCategory.CLASSROOM_EQUIPMENT;
  } else if (lower.includes('electric') || lower.includes('power') || lower.includes('breaker') || lower.includes('switchboard') || lower.includes('spark') || lower.includes('blackout') || lower.includes('short circuit') || lower.includes('voltage') || lower.includes('tripped')) {
    category = TicketCategory.ELECTRICAL;
  } else if (lower.includes('leak') || lower.includes('pipe') || lower.includes('water') || lower.includes('flush') || lower.includes('tap') || lower.includes('drain') || lower.includes('sink') || lower.includes('restroom') || lower.includes('washroom')) {
    category = TicketCategory.PLUMBING;
  } else if (lower.includes('ac ') || lower.includes('air conditioning') || lower.includes('hvac') || lower.includes('cooling') || lower.includes('chiller') || lower.includes('ventilation') || lower.includes('heating')) {
    category = TicketCategory.HVAC;
  } else if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('network') || lower.includes('internet') || lower.includes('lan') || lower.includes('ethernet') || lower.includes('router') || lower.includes('switch') || lower.includes('dns')) {
    category = TicketCategory.NETWORK_WIFI;
  } else if (lower.includes('door') || lower.includes('lock') || lower.includes('window') || lower.includes('ceiling') || lower.includes('wall') || lower.includes('stair') || lower.includes('roof')) {
    category = TicketCategory.INFRASTRUCTURE;
  }

  // 2. Room & Building extraction
  let roomNumber: string | null = null;
  let buildingCode: string | null = null;

  // Patterns like "Block A Room 204", "A-204", "Room A204", "Block B Lab 102", "B-101"
  const roomPattern = /(?:block\s*([abc])\s*(?:room|lab)?\s*([0-9]{3}))|(?:([abc])[- ]?([0-9]{3}))/i;
  const match = text.match(roomPattern);
  if (match) {
    if (match[1] && match[2]) {
      buildingCode = `BLOCK-${match[1].toUpperCase()}`;
      roomNumber = `${match[1].toUpperCase()}-${match[2]}`;
    } else if (match[3] && match[4]) {
      buildingCode = `BLOCK-${match[3].toUpperCase()}`;
      roomNumber = `${match[3].toUpperCase()}-${match[4]}`;
    }
  }

  // Equipment extraction
  let equipmentName: string | null = null;
  if (lower.includes('projector')) equipmentName = 'Laser Projector';
  else if (lower.includes('breaker') || lower.includes('power panel')) equipmentName = 'Main Distribution Panel / Breaker';
  else if (lower.includes('air conditioner') || lower.includes('ac')) equipmentName = 'Air Conditioning Unit';
  else if (lower.includes('switch') || lower.includes('router') || lower.includes('access point')) equipmentName = 'Network Switch / Wi-Fi AP';
  else if (lower.includes('microphone') || lower.includes('mic') || lower.includes('podium')) equipmentName = 'Smart Podium & Audio System';

  // 3. Priority and Disruption Risk Assessment
  let priority: Priority = Priority.MEDIUM;
  let urgencyReason = 'Standard maintenance ticket queue.';
  let isDisruptionRisk = false;

  const hasExam = lower.includes('exam') || lower.includes('test') || lower.includes('examination') || lower.includes('finals') || lower.includes('midterm');
  const isImminent = lower.includes('tomorrow') || lower.includes('today') || lower.includes('now') || lower.includes('urgent') || lower.includes('critical') || lower.includes('in 1 hour');

  if (hasExam && (isImminent || lower.includes('examination tomorrow') || lower.includes('exam tomorrow'))) {
    priority = Priority.CRITICAL;
    urgencyReason = 'Direct disruption risk to scheduled academic examination.';
    isDisruptionRisk = true;
  } else if (category === TicketCategory.ELECTRICAL && (lower.includes('spark') || lower.includes('blackout') || lower.includes('fire'))) {
    priority = Priority.CRITICAL;
    urgencyReason = 'Immediate life safety and campus electrical hazard.';
  } else if (category === TicketCategory.PLUMBING && lower.includes('flooding')) {
    priority = Priority.HIGH;
    urgencyReason = 'Active water flooding risk to campus equipment and structures.';
  } else if (hasExam || isImminent) {
    priority = Priority.HIGH;
    urgencyReason = 'High academic impact or time-sensitive request.';
    isDisruptionRisk = true;
  } else if (category === TicketCategory.ELECTRICAL || category === TicketCategory.HVAC) {
    priority = Priority.MEDIUM;
    urgencyReason = 'Facility utility requires scheduled technician inspection.';
  } else {
    priority = Priority.LOW;
  }

  // 4. Missing Information detection & Clarification questions
  const missingInformation: string[] = [];
  const clarificationQuestions: string[] = [];

  if (!roomNumber) {
    missingInformation.push('Room / Location identifier');
    clarificationQuestions.push('Which specific room, laboratory, or hall is experiencing this issue?');
  }
  if (!buildingCode) {
    missingInformation.push('Building / Campus zone');
    clarificationQuestions.push('Which campus block or building is this located in?');
  }
  if (!equipmentName && category === TicketCategory.CLASSROOM_EQUIPMENT) {
    missingInformation.push('Affected equipment asset tag or model');
    clarificationQuestions.push('Could you specify the exact equipment (e.g. Projector, Audio System, Smart Podium)?');
  }

  // 5. Summary generation
  let summary = text.trim();
  if (equipmentName && roomNumber) {
    summary = `${equipmentName} issue reported in ${roomNumber}${hasExam ? ' prior to examination' : ''}.`;
  } else if (roomNumber) {
    summary = `${category.replace('_', ' ')} incident reported in ${roomNumber}.`;
  }

  return {
    category,
    buildingCode,
    roomNumber,
    equipmentName,
    priority,
    urgencyReason,
    summary,
    missingInformation,
    clarificationQuestions,
    isDisruptionRisk,
    confidenceScore: 0.94,
    engine: 'Campus360 Heuristic NLP Engine (Offline Fallback)',
  };
}

// LLM-powered extraction with Groq API
export async function analyzeComplaintWithGroq(text: string): Promise<ComplaintAnalysis | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI Incident Intelligence specialist for Campus360, an enterprise university operations platform.
Analyze the user complaint text and extract structured incident intelligence.
Respond ONLY with a valid JSON object matching this schema:
{
  "category": "ELECTRICAL" | "PLUMBING" | "NETWORK_WIFI" | "HVAC" | "CLASSROOM_EQUIPMENT" | "INFRASTRUCTURE" | "OTHER",
  "buildingCode": "BLOCK-A" | "BLOCK-B" | "BLOCK-C" | null,
  "roomNumber": "A-204" | "B-101" | etc or null,
  "equipmentName": "Projector" | "Breaker" | etc or null,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "urgencyReason": "string explanation",
  "summary": "Concise 1-sentence technical incident summary",
  "missingInformation": ["array of missing items like room, asset tag"],
  "clarificationQuestions": ["array of clarifying questions to ask user"],
  "isDisruptionRisk": true/false,
  "confidenceScore": float between 0.8 and 1.0
}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return ComplaintAnalysisSchema.parse({
      ...parsed,
      engine: 'Groq Llama-3.3-70b-Versatile',
    });
  } catch (error) {
    console.warn('[AI Service] Groq LLM failed or not reachable, switching to heuristic fallback:', error);
    return null;
  }
}

// Master AI Intelligence pipeline with database verification
export async function processComplaintIntelligence(text: string): Promise<VerifiedIncidentEntities> {
  // 1. Try Groq LLM first, fallback to offline heuristic NLP
  let analysis = await analyzeComplaintWithGroq(text);
  if (!analysis) {
    analysis = analyzeComplaintHeuristically(text);
  }

  // 2. Deterministic Verification against PostgreSQL Database (Section 6 Requirement: "AI must not invent campus records")
  let verifiedBuilding = null;
  let verifiedRoom = null;
  let verifiedEquipment = null;
  let duplicateCandidate = null;
  let affectedSchedule = null;

  // Verify Building
  if (analysis.buildingCode) {
    const bldg = await prisma.building.findFirst({
      where: {
        OR: [
          { code: { equals: analysis.buildingCode, mode: 'insensitive' } },
          { name: { contains: analysis.buildingCode.replace('BLOCK-', ''), mode: 'insensitive' } },
        ],
      },
      select: { id: true, code: true, name: true },
    });
    verifiedBuilding = bldg;
  }

  // Verify Room
  if (analysis.roomNumber) {
    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { roomNumber: { equals: analysis.roomNumber, mode: 'insensitive' } },
          { code: { contains: analysis.roomNumber, mode: 'insensitive' } },
        ],
      },
      select: { id: true, roomNumber: true, capacity: true, status: true, buildingId: true },
    });

    if (room) {
      verifiedRoom = {
        id: room.id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        status: room.status,
      };

      if (!verifiedBuilding) {
        verifiedBuilding = await prisma.building.findUnique({
          where: { id: room.buildingId },
          select: { id: true, code: true, name: true },
        });
      }

      // Check for DUPLICATE COMPLAINTS in the same room
      const existingOpenTicket = await prisma.ticket.findFirst({
        where: {
          roomId: room.id,
          category: analysis.category,
          status: { in: [TicketStatus.OPEN, TicketStatus.TRIAGED, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.BLOCKED] },
        },
        select: { id: true, title: true, status: true, priority: true },
        orderBy: { createdAt: 'desc' },
      });

      if (existingOpenTicket) {
        duplicateCandidate = existingOpenTicket;
      }

      // Check for AFFECTED EXAMINATIONS OR SCHEDULES in this room
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scheduledExam = await prisma.examination.findFirst({
        where: {
          roomId: room.id,
          examDate: { gte: today },
        },
        select: { courseTitle: true, studentCount: true, startTime: true, endTime: true },
      });

      if (scheduledExam) {
        affectedSchedule = {
          title: scheduledExam.courseTitle,
          studentCount: scheduledExam.studentCount,
          startTime: scheduledExam.startTime,
          endTime: scheduledExam.endTime,
        };
        analysis.isDisruptionRisk = true;
        analysis.priority = Priority.CRITICAL;
      }
    }
  }

  // Verify Equipment
  if (analysis.equipmentName && verifiedRoom) {
    const equip = await prisma.equipment.findFirst({
      where: {
        roomId: verifiedRoom.id,
        name: { contains: analysis.equipmentName, mode: 'insensitive' },
      },
      select: { id: true, name: true, assetTag: true },
    });
    if (equip) {
      verifiedEquipment = equip;
    }
  }

  return {
    analysis,
    verifiedBuilding,
    verifiedRoom,
    verifiedEquipment,
    duplicateCandidate,
    affectedSchedule,
  };
}

