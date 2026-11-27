const Database = require("better-sqlite3");
const bcrypt   = require("bcrypt");
const path     = require("path");
const fs       = require("fs");

const databaseFolder = path.join(__dirname, "../../database");

if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

// DB_PATH can be overridden in tests (e.g. ":memory:" or a temp file)
const databasePath = process.env.DB_PATH || path.join(databaseFolder, "bananagame.db");

const db = new Database(databasePath);

// Enforce referential integrity so score rows cannot outlive their user
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    NOT NULL UNIQUE,
        email         TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        role          TEXT    NOT NULL DEFAULT 'player',
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scores (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        score      INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);

// Migration: add the role column to databases created before v2.0.0
function columnExists(table, column) {
    return db.prepare(`PRAGMA table_info(${table})`).all().some(row => row.name === column);
}

if (!columnExists("users", "role")) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'player'");
}

// Demo admin — hardcoded for coursework only.
// In production, credentials should come from environment variables or a
// one-time seed script, never hardcoded in source.
const ADMIN_EMAIL    = "admin@gmail.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

function ensureAdminUser() {
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);

    // Reset the demo admin if this email already exists — keeps the hardcoded
    // credentials predictable even after a password change in an earlier run
    const byEmail = db.prepare("SELECT id FROM users WHERE email = ?").get(ADMIN_EMAIL);

    if (byEmail) {
        db.prepare("UPDATE users SET username = ?, password_hash = ?, role = 'admin' WHERE id = ?")
            .run(ADMIN_USERNAME, passwordHash, byEmail.id);
        return;
    }

    // Handle a conflicting username with a different email
    const byUsername = db.prepare("SELECT id FROM users WHERE username = ?").get(ADMIN_USERNAME);

    if (byUsername) {
        db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?")
            .run(passwordHash, byUsername.id);
        return;
    }

    db.prepare("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'admin')")
        .run(ADMIN_USERNAME, ADMIN_EMAIL, passwordHash);
}

ensureAdminUser();

console.log("SQLite database connected successfully.");

module.exports = db;
