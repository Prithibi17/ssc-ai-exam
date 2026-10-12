import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, phone } = await req.json();

    const cleanCode = code?.trim().toUpperCase();
    const cleanPhone = phone?.trim() || 'anonymous';

    if (!cleanCode) {
      return NextResponse.json({ success: false, message: 'Activation code required' }, { status: 400 });
    }

    const db = getDb();

    // Check code in Turso
    const codeRes = await db.execute({
      sql: `SELECT * FROM activation_codes WHERE UPPER(code) = ?;`,
      args: [cleanCode],
    });

    if (codeRes.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid code. Please check for typos or message Telegram @ +91 9800615892.',
      }, { status: 404 });
    }

    const target = codeRes.rows[0];
    if (target.is_used) {
      return NextResponse.json({
        success: false,
        message: `This code was already used on ${target.used_at ? new Date(target.used_at as string).toLocaleDateString() : 'earlier'}. Each code is 1-time single use only.`,
      }, { status: 409 });
    }

    // Mark as used
    const now = new Date().toISOString();
    const durationDays = Number(target.duration_days) || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await db.execute({
      sql: `UPDATE activation_codes SET is_used = 1, used_by_phone = ?, used_at = ? WHERE id = ?;`,
      args: [cleanPhone, now, target.id],
    });

    // Update or insert subscription for user
    await db.execute({
      sql: `INSERT INTO subscriptions (user_phone, is_active, plan_id, plan_name, price, activated_at, expires_at, activation_code_used)
            VALUES (?, 1, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_phone) DO UPDATE SET 
              is_active = 1, 
              plan_id = ?, 
              plan_name = ?, 
              price = ?, 
              activated_at = ?, 
              expires_at = ?, 
              activation_code_used = ?;`,
      args: [
        cleanPhone, target.plan_tier, target.plan_name, target.price, now, expiresAt, target.code,
        target.plan_tier, target.plan_name, target.price, now, expiresAt, target.code,
      ],
    });

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully activated ${target.plan_name}! Unlimited mock tests and full PYQ Bank unlocked until ${new Date(expiresAt).toLocaleDateString()}.`,
      subscription: {
        isActive: true,
        planName: target.plan_name,
        expiresAt,
        activationCodeUsed: target.code,
      },
    });
  } catch (error: any) {
    console.error('Redeem API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Database error' }, { status: 500 });
  }
}
