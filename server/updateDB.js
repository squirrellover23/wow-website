const { db } = require("./database");

// one time sql querys to update the database

db.run("ALTER TABLE classes ADD COLUMN archived BOOLEAN DEFAULT 0", (err) => {
    if (err) {
        console.log(err);
    }
});
