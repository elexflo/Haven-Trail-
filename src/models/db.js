const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/haventrail.db');

function getDb(){
  return new sqlite3.Database(DB_PATH);
}

function init(){
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = getDb();
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      type TEXT,
      description TEXT,
      price REAL,
      image TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      checkin TEXT,
      checkout TEXT,
      nights INTEGER,
      total REAL,
      paid INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Settings table for site content
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // Seed admin user if not exists
    db.get('SELECT COUNT(*) as c FROM users', (err, row) => {
      if (err) return console.error(err);
      if (row.c === 0){
        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASS || 'changeme';
        bcrypt.hash(adminPass, 10).then(hash => {
          db.run('INSERT INTO users (username, password_hash) VALUES (?,?)', [adminUser, hash]);
          console.log('Seeded admin user:', adminUser);
        });
      }
    });

    // Seed default site settings if not present
    const defaultSiteName = process.env.SITE_NAME || 'Haven Trail';
    const defaultWelcome = `Welcome to ${defaultSiteName}. We are happy to host you in the Maldives. Add a bio in the admin panel.`;

    db.get('SELECT value FROM settings WHERE key = ?', ['site_name'], (err, row) => {
      if (err) return console.error(err);
      if (!row) db.run('INSERT INTO settings (key, value) VALUES (?,?)', ['site_name', defaultSiteName]);
    });
    db.get('SELECT value FROM settings WHERE key = ?', ['welcome_text'], (err, row) => {
      if (err) return console.error(err);
      if (!row) db.run('INSERT INTO settings (key, value) VALUES (?,?)', ['welcome_text', defaultWelcome]);
    });

  });
  db.close();
}

module.exports = { getDb, init };
