import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    const cleanPhone = phone?.toString().trim();
    const cleanPass = password?.toString().trim();

    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, message: 'Please enter your mobile number or ID.' },
        { status: 400 }
      );
    }

    if (!cleanPass) {
      return NextResponse.json(
        { success: false, message: 'Please enter your password.' },
        { status: 400 }
      );
    }

    // Owner / Super Admin check: strictly authenticated on server
    const isOwner =
      (cleanPhone === 'owner123' || cleanPhone === 'owner.123' || cleanPhone === '9800615892') &&
      (cleanPass === 'owner123' || cleanPass === 'owner.123');

    if (isOwner) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin_owner_01',
          fullName: 'System Owner & Super Admin',
          phone: cleanPhone,
          role: 'admin',
          streakDays: 99,
          totalQuestionsPracticed: 9999,
          overallAccuracy: 100,
          subscription: {
            isActive: true,
            planName: 'Owner Super Access (Lifetime)',
            expiresAt: '2099-12-31T23:59:59.000Z',
          },
          dailyTestsTaken: {},
        },
      });
    }

    const db = await ensureDb();

    // Query user by phone
    const userRes = await db.execute({
      sql: `SELECT * FROM users WHERE phone = ?;`,
      args: [cleanPhone],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          message: 'No account found with this mobile number. Please click "Create Account" first.',
        },
        { status: 404 }
      );
    }

    const user = userRes.rows[0];

    // Password verification
    if (user.password && user.password !== cleanPass) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Streak calculation & update in Turso database
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastActive = (user.last_active_date as string) || '';
    const currentStreak = Number(user.streak_days) || 1;

    let updatedStreak = currentStreak;
    if (lastActive === yesterday) {
      updatedStreak = currentStreak + 1;
    } else if (lastActive === today) {
      updatedStreak = currentStreak;
    } else if (lastActive && lastActive < yesterday) {
      // Missed a day -> reset to 1
      updatedStreak = 1;
    }

    // Save updated streak and last active date to Turso DB
    await db.execute({
      sql: `UPDATE users SET streak_days = ?, last_active_date = ? WHERE id = ?;`,
      args: [updatedStreak, today, user.id],
    });

    // Fetch subscription status from Turso DB
    const subRes = await db.execute({
      sql: `SELECT * FROM subscriptions WHERE user_phone = ?;`,
      args: [cleanPhone],
    });
    const sub = subRes.rows[0];

    const isSubActive = Boolean(
      sub &&
      sub.is_active &&
      sub.expires_at &&
      new Date(sub.expires_at as string).getTime() > Date.now()
    );

    // Fetch daily tests taken today from Turso DB
    const dailyLogsRes = await db.execute({
      sql: `SELECT COUNT(*) as test_count FROM daily_test_logs WHERE user_phone = ? AND date_str = ?;`,
      args: [cleanPhone, today],
    });
    const testsToday = Number(dailyLogsRes.rows[0]?.test_count) || 0;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id as string,
        phone: user.phone as string,
        fullName: (user.full_name as string) || `Aspirant ${cleanPhone.slice(-4)}`,
        role: (user.role as string) || 'student',
        streakDays: updatedStreak,
        totalQuestionsPracticed: Number(user.total_questions_practiced) || 0,
        overallAccuracy: Number(user.overall_accuracy) || 0,
        subscription: isSubActive
          ? {
              isActive: true,
              planName: (sub.plan_name as string) || 'Unlimited Pro',
              expiresAt: sub.expires_at as string,
            }
          : { isActive: false },
        dailyTestsTaken: {
          [today]: testsToday,
        },
      },
    });
  } catch (error: any) {
    console.error('Auth login API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Database error occurred during sign-in.' },
      { status: 500 }
    );
  }
}
