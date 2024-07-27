const { db } = require("./database");

// one time sql querys to update the database

db.run("ALTER TABLE classes ADD COLUMN archived BOOLEAN", (err) => {
    if (err) {
        console.log(err);
    } else {
        db.run(
            "UPDATE classes SET archived = FALSE WHERE archived IS 0",
            (err1) => {
                if (err) {
                    console.log(err1);
                }
            }
        );
    }
});
