const { db } = require("./database");

// one time sql querys to update the database

db.run("ALTER TABLE classes ADD COLUMN retired BOOLEAN", (err) => {
    if (err) {
        console.log(err);
    } else {
        db.run(
            "UPDATE classes SET retired = FALSE WHERE retired IS NULL",
            (err1) => {
                if (err) {
                    console.log(err1);
                }
            }
        );
    }
});
