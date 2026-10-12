import { NextRequest, NextResponse } from 'next/server';
import { askAITutor } from '@/lib/ai/openrouter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, contextQuestion, mode, questionData } = body;

    if (mode === 'kid_teacher' && questionData) {
      const { askKidTeacher } = await import('@/lib/ai/openrouter');
      const response = await askKidTeacher({
        questionText: questionData.questionText,
        options: questionData.options,
        correctOption: questionData.correctOption,
        userSelected: questionData.userSelected,
        subjectCode: questionData.subjectCode || 'general',
      });
      return NextResponse.json({
        success: true,
        data: response,
      });
    }

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    const response = await askAITutor(query, contextQuestion);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (err: any) {
    console.error('API /api/ai/tutor error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'AI Tutor encountered an error answering your doubt.',
      },
      { status: 500 }
    );
  }
}
