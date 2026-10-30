const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Use Railway's persistent volume when DB_PATH is configured.
// Otherwise, use the local development database.
const dbPath = process.env.DB_PATH ||
    path.join(__dirname, "..", "data", "nagara.db");

// Create the database directory if it does not exist.
const dataDirectory = path.dirname(dbPath);

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

// Connect to SQLite.
const db = new Database(dbPath);

// Configure SQLite.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create reports table and indexes.
db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        image_url TEXT,
        summary TEXT,
        priority TEXT DEFAULT 'MEDIUM',
        priority_score INTEGER DEFAULT 0,
        priority_reason TEXT,
        department TEXT,
        assigned_to TEXT,
        status TEXT DEFAULT 'SUBMITTED',
        duplicate_of TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (duplicate_of) REFERENCES reports(id)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_category
    ON reports(category);

    CREATE INDEX IF NOT EXISTS idx_reports_priority
    ON reports(priority);

    CREATE INDEX IF NOT EXISTS idx_reports_status
    ON reports(status);

    CREATE INDEX IF NOT EXISTS idx_reports_location
    ON reports(location_name);

    CREATE INDEX IF NOT EXISTS idx_reports_created
    ON reports(created_at);
`);

console.log("NAGARA AI database initialized successfully!");
console.log(`Database location: ${dbPath}`);

module.exports = db;