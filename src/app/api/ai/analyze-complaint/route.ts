import { NextRequest, NextResponse } from 'next/server';
import { processComplaintIntelligence } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text prompt is required for AI complaint analysis' }, { status: 400 });
    }

    const result = await processComplaintIntelligence(text);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AI Complaint Analysis Error]', error);
    return NextResponse.json({ error: 'Failed to process AI incident intelligence' }, { status: 500 });
  }
}

