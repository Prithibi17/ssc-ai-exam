import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const res = await db.execute(`SELECT * FROM activation_codes ORDER BY created_at DESC;`);
    const codes = res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      planTier: r.plan_tier,
      planName: r.plan_name,
      price: r.price,
      durationDays: r.duration_days,
      createdAt: r.created_at,
      isUsed: Boolean(r.is_used),
      usedByPhone: r.used_by_phone,
      usedAt: r.used_at,
    }));
    return NextResponse.json({ success: true, codes });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { planTier, quantity = 1 } = await req.json();

    const plansMeta: Record<string, { duration: number; price: number; name: string }> = {
      sprint_5: { duration: 7, price: 5, name: '7-Day Exam Sprint Pass (₹5)' },
      monthly_10: { duration: 30, price: 10, name: '1 Month Unlimited Pro (₹10)' },
      quarterly_25: { duration: 90, price: 25, name: '3 Months Target Tier-1 (₹25)' },
      half_yearly_45: { duration: 180, price: 45, name: '6 Months Comprehensive (₹45)' },
      yearly_79: { duration: 365, price: 79, name: '1 Year Full Season Pass (₹79)' },
      lifetime_149: { duration: 3650, price: 149, name: 'Lifetime Selection Pass (₹149)' },
    };

    const target = plansMeta[planTier] || plansMeta.monthly_10;
    const db = getDb();
    const generated = [];

    for (let i = 0; i < Number(quantity); i++) {
      const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const prefix = planTier === 'monthly_10' ? 'SSC-PRO-10' : 'PARIKSHA-PRO';
      const codeStr = `${prefix}-${p1}-${p2}`;
      const id = `act_${Date.now()}_${p1}`;
      const createdAt = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO activation_codes (id, code, plan_tier, plan_name, price, duration_days, created_at, is_used)
              VALUES (?, ?, ?, ?, ?, ?, ?, 0);`,
        args: [id, codeStr, planTier, target.name, target.price, target.duration, createdAt],
      });

      generated.push({
        id,
        code: codeStr,
        planTier,
        planName: target.name,
        price: target.price,
        durationDays: target.duration,
        createdAt,
        isUsed: false,
      });
    }

    return NextResponse.json({ success: true, codes: generated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
