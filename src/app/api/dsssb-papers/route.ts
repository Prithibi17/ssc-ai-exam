import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DSSSB_PAPERS_CATALOGUE } from '@/data/dsssb_papers_meta';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    // Return catalogue list of all papers
    return NextResponse.json({
      success: true,
      totalPapers: DSSSB_PAPERS_CATALOGUE.length,
      papers: DSSSB_PAPERS_CATALOGUE,
    });
  }

  // Look up specific paper
  const meta = DSSSB_PAPERS_CATALOGUE.find((p) => p.id === id);
  const filePath = path.join(process.cwd(), 'public', 'dsssb_papers', `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { success: false, error: `Paper ${id} not found` },
      { status: 404 }
    );
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      meta: meta || null,
      count: questions.length,
      questions,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
