import { NextRequest, NextResponse } from 'next/server';
import { VERIFIED_PYQ_QUESTIONS } from '@/data/questions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const year = searchParams.get('year');
    const tier = searchParams.get('tier');
    const shift = searchParams.get('shift');
    const difficulty = searchParams.get('difficulty');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const search = searchParams.get('search')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let filtered = [...VERIFIED_PYQ_QUESTIONS];

    if (exam && exam !== 'all') {
      filtered = filtered.filter((q) => q.provenance.examCode.toLowerCase() === exam.toLowerCase());
    }

    if (subject && subject !== 'all') {
      filtered = filtered.filter((q) => q.subjectCode.toLowerCase() === subject.toLowerCase());
    }

    if (topic && topic !== 'all') {
      filtered = filtered.filter((q) => q.topicCode.toLowerCase() === topic.toLowerCase());
    }

    if (year) {
      filtered = filtered.filter((q) => q.provenance.year === parseInt(year, 10));
    }

    if (tier && tier !== 'all') {
      filtered = filtered.filter((q) => q.provenance.tier.toLowerCase() === tier.toLowerCase());
    }

    if (shift) {
      filtered = filtered.filter((q) => q.provenance.shift === parseInt(shift, 10));
    }

    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    if (verifiedOnly) {
      filtered = filtered.filter((q) => q.isVerified && !q.isAiGenerated);
    }

    if (search) {
      filtered = filtered.filter(
        (q) =>
          q.questionText.toLowerCase().includes(search) ||
          q.provenance.examName.toLowerCase().includes(search) ||
          q.explanation.standard.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: filtered.length,
      questions: filtered.slice(0, limit),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
