const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://ssc-prithibi.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

async function main() {
  console.log('Connecting to Turso...');
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password TEXT,
      role TEXT DEFAULT 'student',
      target_exams TEXT DEFAULT '["ssc_cgl"]',
      preferred_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ users table created/verified');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_phone TEXT PRIMARY KEY,
      is_active INTEGER DEFAULT 0,
      plan_id TEXT,
      plan_name TEXT,
      price REAL,
      activated_at TEXT,
      expires_at TEXT,
      activation_code_used TEXT
    );
  `);
  console.log('✓ subscriptions table created/verified');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS activation_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      plan_tier TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      price REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      is_used INTEGER DEFAULT 0,
      used_by_phone TEXT,
      used_at TEXT
    );
  `);
  console.log('✓ activation_codes table created/verified');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS payment_submissions (
      id TEXT PRIMARY KEY,
      user_phone TEXT NOT NULL,
      user_name TEXT,
      amount REAL NOT NULL,
      transaction_id TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      generated_code TEXT
    );
  `);
  console.log('✓ payment_submissions table created/verified');

  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_test_logs (
      id TEXT PRIMARY KEY,
      user_phone TEXT NOT NULL,
      date_str TEXT NOT NULL,
      test_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ daily_test_logs table created/verified');

  // Insert seed codes
  await client.execute({
    sql: `INSERT OR IGNORE INTO activation_codes (id, code, plan_tier, plan_name, price, duration_days, created_at, is_used) 
          VALUES ('code_seed_01', 'PARIKSHA-PRO-10-DEMO', 'monthly_10', '1 Month Unlimited Pro', 10, 30, datetime('now'), 0);`,
    args: [],
  });

  await client.execute({
    sql: `INSERT OR IGNORE INTO activation_codes (id, code, plan_tier, plan_name, price, duration_days, created_at, is_used) 
          VALUES ('code_seed_02', 'SSC-PRO-10-LAUNCH', 'monthly_10', '1 Month Unlimited Pro', 10, 30, datetime('now'), 0);`,
    args: [],
  });

  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('\nAll Turso Tables:', res.rows.map(r => r.name));
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
