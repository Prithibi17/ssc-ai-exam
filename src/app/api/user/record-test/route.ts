import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone, testId, title, score, maxMarks, accuracy, questionsCount, summary } = await req.json();

    const cleanPhone = phone?.toString().trim();
    if (!cleanPhone) {
      return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 });
    }

    const db = await ensureDb();
    const today = new Date().toISOString().split('T')[0];
    const logId = `dtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    // 1. Log daily test
    await db.execute({
      sql: `INSERT INTO daily_test_logs (id, user_phone, date_str, test_id) VALUES (?, ?, ?, ?);`,
      args: [logId, cleanPhone, today, testId || 'mock_test'],
    });

    // 2. Log test attempt if test details provided
    if (testId) {
      const attemptId = `att_${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO test_attempts (id, user_phone, test_id, title, score, max_marks, accuracy, summary_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        args: [
          attemptId,
          cleanPhone,
          testId,
          title || 'Full Mock Test',
          Number(score) || 0,
          Number(maxMarks) || 200,
          Number(accuracy) || 0,
          summary ? JSON.stringify(summary) : null,
        ],
      });
    }

    // 3. Update user questions practiced and accuracy in Turso DB
    const addedQuestions = Number(questionsCount) || 25;
    const userRes = await db.execute({
      sql: `SELECT * FROM users WHERE phone = ?;`,
      args: [cleanPhone],
    });

    let updatedStreak = 1;
    let totalPracticed = addedQuestions;

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      const prevTotal = Number(user.total_questions_practiced) || 0;
      totalPracticed = prevTotal + addedQuestions;

      // Maintain streak
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const lastActive = (user.last_active_date as string) || '';
      const currentStreak = Number(user.streak_days) || 1;

      if (lastActive === yesterday) {
        updatedStreak = currentStreak + 1;
      } else if (lastActive === today) {
        updatedStreak = currentStreak;
      } else {
        updatedStreak = 1;
      }

      await db.execute({
        sql: `UPDATE users SET 
                total_questions_practiced = ?, 
                streak_days = ?, 
                last_active_date = ? 
              WHERE phone = ?;`,
        args: [totalPracticed, updatedStreak, today, cleanPhone],
      });
    }

    // 4. Return new test count today
    const dailyLogsRes = await db.execute({
      sql: `SELECT COUNT(*) as test_count FROM daily_test_logs WHERE user_phone = ? AND date_str = ?;`,
      args: [cleanPhone, today],
    });
    const testsToday = Number(dailyLogsRes.rows[0]?.test_count) || 1;

    return NextResponse.json({
      success: true,
      streakDays: updatedStreak,
      totalQuestionsPracticed: totalPracticed,
      dailyTestsToday: testsToday,
    });
  } catch (error: any) {
    console.error('Record test API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}
