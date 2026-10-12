import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const res = await db.execute(`SELECT * FROM payment_submissions ORDER BY submitted_at DESC;`);
    const submissions = res.rows.map((r) => ({
      id: r.id,
      userPhone: r.user_phone,
      userName: r.user_name,
      amount: r.amount,
      transactionId: r.transaction_id,
      submittedAt: r.submitted_at,
      status: r.status,
      generatedCode: r.generated_code,
    }));
    return NextResponse.json({ success: true, submissions });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userPhone, userName, transactionId, amount = 10 } = await req.json();

    const cleanPhone = userPhone?.trim() || 'anonymous';
    const cleanUtr = transactionId?.trim().toUpperCase();

    if (!cleanUtr) {
      return NextResponse.json({ success: false, message: 'Transaction ID required' }, { status: 400 });
    }

    const db = getDb();
    const id = `pay_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO payment_submissions (id, user_phone, user_name, amount, transaction_id, submitted_at, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending');`,
      args: [id, cleanPhone, userName || 'Aspirant', amount, cleanUtr, now],
    });

    return NextResponse.json({
      success: true,
      submission: {
        id,
        userPhone: cleanPhone,
        userName,
        amount,
        transactionId: cleanUtr,
        submittedAt: now,
        status: 'pending',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
