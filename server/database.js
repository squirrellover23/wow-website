const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.db");
db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS names (firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, total_visits INT DEFAULT 0, enrolled_class_visits INT DEFAULT 0, open_class_visits INT DEFAULT 0, visits_since_vouch INT DEFAULT 0, vouchers_received INT DEFAULT 0, lastLoginTime INT DEFAULT 0)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS login_logs (id INTEGER PRIMARY KEY, class TEXT COLLATE NOCASE, firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, login_time DATETIME);"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY, className TEXT COLLATE NOCASE, registered BOOLEAN, archived BOOLEAN DEFAULT 0)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS vouchers_given(firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, time_given DATETIME)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS auth_tokens(token TEXT COLLATE NOCASE, time_created DATETIME, uses INT DEFAULT 0)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS password(id INTEGER PRIMARY KEY, word TEXT COLLATE BINARY)"
    );
    db.all("SELECT * FROM password", (err, row) => {
        if (err) {
            console.log(err);
        } else if (row.length === 0) {
            db.run(
                "INSERT INTO password (word) VALUES (?)",
                ["hello"],
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
            );
        }
    });
});

module.exports = { db };
