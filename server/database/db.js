const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// 1. Create database directory
const dataDirectory = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

// 2. Connect to SQLite database
const dbPath = path.join(dataDirectory, "nagara.db");
const db = new Database(dbPath);

// 3. Configure SQLite
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// 4. Create reports table and indexes
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

// 5. Confirm database initialization
console.log("NAGARA AI database initialized successfully!");

// 6. Export database connection
module.exports = db;