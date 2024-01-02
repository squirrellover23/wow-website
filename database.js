const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS names (firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, total_visits INT DEFAULT 0, visits_since_vouch INT DEFAULT 0, vouchers_received INT DEFAULT 0, class TEXT COLLATE NOCASE, lastLoginTime INT DEFAULT 0)");
    db.run("CREATE TABLE IF NOT EXISTS login_logs (id INTEGER PRIMARY KEY, class TEXT COLLATE NOCASE, firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, login_time DATETIME);")
    db.run("CREATE TABLE IF NOT EXISTS classes(className TEXT COLLATE NOCASE, registered BOOLEAN)");
    db.run("CREATE TABLE IF NOT EXISTS vouchers_given(firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, time_given DATETIME)")
});

module.exports = {db};