var express = require("express");
const { db } = require("../database");
const { send_email } = require("../email_control");
require("dotenv").config();

var router = express.Router();

router.get("/", function (req, res) {
    let { classChosen } = req.query;
    classChosen = classChosen.split(",");
    const className = classChosen[0];
    const closed = classChosen[1];
    res.render("attendance-page", { open: !Number(closed), classs: className });
});

router.post("/updatevisit", (req, res) => {
    const { firstName, lastName, classIn, closed } = req.body;
    db.get(
        "SELECT * FROM names WHERE firstName = ? AND lastName = ?",
        [firstName, lastName],
        (err, row) => {
            if (err) {
                res.status(500).send("Error checking user existence.");
            } else if (!row) {
                res.status(401).send("Incorrect Login information.");
            } else {
                const lastLoginTime = row.lastLoginTime || 0;
                const currentTime = Date.now();

                if (currentTime - lastLoginTime >= 200 * 1000) {
                    var no_error = true;
                    const query_open =
                        "UPDATE names SET lastLoginTime = ?, total_visits = total_visits + 1, open_class_visits = open_class_visits + 1, visits_since_vouch = visits_since_vouch + 1 WHERE firstName = ? AND lastName = ?";
                    const query_closed =
                        "UPDATE names SET lastLoginTime = ?, total_visits = total_visits + 1, enrolled_class_visits = enrolled_class_visits + 1  WHERE firstName = ? AND lastName = ?";
                    const chosen_query =
                        closed === "true" ? query_closed : query_open;
                    db.run(
                        chosen_query,
                        [currentTime, firstName, lastName],
                        (err) => {
                            if (err) {
                                no_error = false;
                                res.status(500).send(
                                    "Error updating last login time."
                                );
                            }
                        }
                    );
                    if (no_error) {
                        const currentDate = new Date().toISOString();

                        db.run(
                            "INSERT INTO login_logs (class, firstName, lastName, login_time) VALUES (?, ?, ?, ?)",
                            [classIn, firstName, lastName, currentDate],
                            (err) => {
                                if (err) {
                                    no_error = false;
                                    res.status(500).send("Error loging visit.");
                                }
                            }
                        );
                    }
                    if (no_error) {
                        if (row.visits_since_vouch + 1 == 15) {
                            send_email(
                                process.env.EMAIL ||
                                    "petersonwingate@gmail.com",
                                "Voucher Almost Needed",
                                `Student ${firstName} ${lastName} has reached 15 visits and will soon need a voucher. http://${
                                    process.env.URL || "localhost:3000"
                                }/user/${firstName}/${lastName}`
                            );
                        }
                        res.status(200).json({
                            visits: row.visits_since_vouch + 1,
                        });
                    }
                } else {
                    res.status(429).send(
                        "You logged In too recently. Please try again later."
                    );
                }
            }
        }
    );
});

module.exports = router;
