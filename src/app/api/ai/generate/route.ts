import { NextRequest, NextResponse } from 'next/server';
import { generateAIQuestions } from '@/lib/ai/openrouter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, topic, difficulty = 'medium', examCode = 'ssc_cgl', count = 5 } = body;

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Subject and topic are required.' }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(1, Number(count) || 5), 10);
    const questions = await generateAIQuestions({
      subject,
      topic,
      difficulty,
      examCode,
      count: safeCount,
    });

    return NextResponse.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err: any) {
    console.error('API /api/ai/generate error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to generate AI questions. Please verify your API key or try again.',
      },
      { status: 500 }
    );
  }
}
