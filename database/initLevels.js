const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/levels.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            last_message INTEGER,
            voice_time INTEGER DEFAULT 0,
            last_join_voice INTEGER,
            total_score INTEGER DEFAULT 0
        )
    `);
});

module.exports = db;
