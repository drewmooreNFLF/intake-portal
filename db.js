const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Use DATA_DIR to point at a persistent disk (e.g. on Render, mount a disk
// and set DATA_DIR=/var/data) so accounts and submissions survive restarts/redeploys.
const DB_DIR = process.env.DATA_DIR || path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  must_change_password INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  submitted_by TEXT NOT NULL,
  applicant_name TEXT,
  applicant_email TEXT,
  data TEXT NOT NULL,
  files TEXT NOT NULL DEFAULT '{}',
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  submitted_by TEXT NOT NULL,
  notes TEXT,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  rows TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

// Lightweight migration: add the `files` column if this DB predates it.
const submissionCols = db.prepare("PRAGMA table_info(submissions)").all().map((c) => c.name);
if (!submissionCols.includes('files')) {
  db.exec("ALTER TABLE submissions ADD COLUMN files TEXT NOT NULL DEFAULT '{}'");
}

// Seed a default admin account on first run only
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
let seededCredentials = null;
if (userCount === 0) {
  const defaultUser = 'admin';
  const defaultPass = crypto_randomPassword();
  const hash = bcrypt.hashSync(defaultPass, 10);
  db.prepare(
    'INSERT INTO users (username, password_hash, role, display_name, must_change_password) VALUES (?, ?, ?, ?, 1)'
  ).run(defaultUser, hash, 'admin', 'Administrator');
  seededCredentials = { username: defaultUser, password: defaultPass };
}

function crypto_randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 14; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

module.exports = { db, seededCredentials };
