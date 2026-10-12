import { createClient, Client } from '@libsql/client';

let dbClient: Client | null = null;
let schemaInitialized = false;

export function getDb(): Client {
  if (dbClient) return dbClient;

  const url = process.env.TURSO_DATABASE_URL || 'libsql://ssc-prithibi.aws-ap-south-1.turso.io';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  dbClient = createClient({
    url,
    authToken,
  });

  return dbClient;
}

export async function initDatabaseSchema() {
  const db = getDb();

  // 1. Users Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password TEXT,
      role TEXT DEFAULT 'student',
      target_exams TEXT DEFAULT '["ssc_cgl"]',
      preferred_language TEXT DEFAULT 'en',
      streak_days INTEGER DEFAULT 1,
      last_active_date TEXT,
      total_questions_practiced INTEGER DEFAULT 0,
      overall_accuracy REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe column additions for pre-existing tables
  const safeAlterColumns = [
    'ALTER TABLE users ADD COLUMN streak_days INTEGER DEFAULT 1;',
    'ALTER TABLE users ADD COLUMN last_active_date TEXT;',
    'ALTER TABLE users ADD COLUMN total_questions_practiced INTEGER DEFAULT 0;',
    'ALTER TABLE users ADD COLUMN overall_accuracy REAL DEFAULT 0;',
  ];

  for (const sql of safeAlterColumns) {
    try {
      await db.execute(sql);
    } catch {
      // Column likely already exists
    }
  }

  // 2. Subscriptions Table
  await db.execute(`
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

  // 3. Activation Codes Table (1-time single use)
  await db.execute(`
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

  // 4. Payment Submissions / UTR proof Table
  await db.execute(`
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

  // 5. Daily Test Logs Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS daily_test_logs (
      id TEXT PRIMARY KEY,
      user_phone TEXT NOT NULL,
      date_str TEXT NOT NULL,
      test_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Test Attempts History Table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS test_attempts (
      id TEXT PRIMARY KEY,
      user_phone TEXT NOT NULL,
      test_id TEXT NOT NULL,
      title TEXT,
      score REAL,
      max_marks REAL,
      accuracy REAL,
      summary_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert default seed codes if not present
  try {
    await db.execute({
      sql: `INSERT OR IGNORE INTO activation_codes (id, code, plan_tier, plan_name, price, duration_days, created_at, is_used) 
            VALUES ('code_seed_01', 'PARIKSHA-PRO-10-DEMO', 'monthly_10', '1 Month Unlimited Pro', 10, 30, datetime('now'), 0);`,
      args: [],
    });
    await db.execute({
      sql: `INSERT OR IGNORE INTO activation_codes (id, code, plan_tier, plan_name, price, duration_days, created_at, is_used) 
            VALUES ('code_seed_02', 'SSC-PRO-10-LAUNCH', 'monthly_10', '1 Month Unlimited Pro', 10, 30, datetime('now'), 0);`,
      args: [],
    });
  } catch (e) {
    console.warn('Seed codes insertion note:', e);
  }

  schemaInitialized = true;
  return { success: true };
}

export async function ensureDb(): Promise<Client> {
  const db = getDb();
  if (!schemaInitialized) {
    try {
      await initDatabaseSchema();
    } catch (e) {
      console.warn('Database initialization note:', e);
    }
  }
  return db;
}
