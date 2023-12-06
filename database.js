const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS names (firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, visited INT DEFAULT 0, class TEXT COLLATE NOCASE, lastLoginTime INT DEFAULT 0)");
    db.run("CREATE TABLE IF NOT EXISTS login_logs (id INTEGER PRIMARY KEY, class TEXT COLLATE NOCASE, firstName TEXT COLLATE NOCASE, lastName TEXT COLLATE NOCASE, login_time DATETIME);")
});

module.exports = {db};