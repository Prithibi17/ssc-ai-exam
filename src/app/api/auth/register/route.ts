import { NextResponse } from 'next/server';
import { ensureDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { phone, password, fullName } = await req.json();

    const cleanPhone = phone?.toString().trim();
    const cleanPass = password?.toString().trim();
    const cleanName = fullName?.toString().trim();

    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid mobile number.' },
        { status: 400 }
      );
    }

    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: 'Please provide your full name.' },
        { status: 400 }
      );
    }

    if (!cleanPass || cleanPass.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    // Owner protection: reserve owner credentials
    if (cleanPhone.toLowerCase() === 'owner123' || cleanPhone.toLowerCase() === 'owner.123') {
      return NextResponse.json(
        { success: false, message: 'This identifier is reserved by system administration.' },
        { status: 400 }
      );
    }

    const db = await ensureDb();

    // Check if phone already registered
    const existing = await db.execute({
      sql: `SELECT id, phone FROM users WHERE phone = ?;`,
      args: [cleanPhone],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this mobile number already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const userId = `usr_${Date.now()}`;

    await db.execute({
      sql: `INSERT INTO users (id, phone, full_name, password, role, streak_days, last_active_date, total_questions_practiced, overall_accuracy)
            VALUES (?, ?, ?, ?, 'student', 1, ?, 0, 0);`,
      args: [userId, cleanPhone, cleanName, cleanPass, today],
    });

    // Check if any subscription exists for this phone
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

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to ParikshaAI.',
      user: {
        id: userId,
        phone: cleanPhone,
        fullName: cleanName,
        role: 'student',
        streakDays: 1,
        totalQuestionsPracticed: 0,
        overallAccuracy: 0,
        subscription: isSubActive
          ? {
              isActive: true,
              planName: (sub.plan_name as string) || 'Unlimited Pro',
              expiresAt: sub.expires_at as string,
            }
          : { isActive: false },
        dailyTestsTaken: {},
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Database error occurred during registration.' },
      { status: 500 }
    );
  }
}
