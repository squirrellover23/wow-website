const express = require("express");
const { db } = require("../database");
const uuid = require("uuid");

// one week in milliseconds
const maxTokenAge = 604800000;
const password = "hello";

var router = express.Router();

router.get("/", (req, res) => {
    const authToken = req.cookies["token"];
    db.get(
        "SELECT 1 FROM auth_tokens WHERE token = ? LIMIT 1;",
        [authToken],
        (err, row) => {
            if (err) {
                console.error(err);
            } else if (row) {
                res.redirect("/attendance-settings");
            } else {
                res.render("sign-in");
            }
        }
    );
});

router.post("/sign-in", (req, res) => {
    if (req.body.password === password) {
        const token = uuid.v4();
        const currentDate = new Date().toISOString();
        db.run(
            "INSERT INTO auth_tokens (token, time_created) VALUES (?, ?)",
            [token, currentDate],
            (err) => {
                if (err) {
                    res.status(500).send("Error Creating Token");
                }
            }
        );
        setAuthCookie(res, token);
        clearOldTokens();
        res.redirect("/attendance-settings");
    } else {
        res.status(401).send("Unauthorized");
    }
});

function clearOldTokens() {
    const currentDate = new Date();
    const expiredDateMillis = currentDate.getTime() - maxTokenAge;
    const expiredDate = new Date(expiredDateMillis)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    db.run(
        "DELETE FROM auth_tokens WHERE time_created <= ?",
        expiredDate,
        function (err) {
            if (err) {
                console.error(err.message);
                return err.message;
            }

        }
    );
}

function setAuthCookie(res, authToken) {
    res.cookie("token", authToken, {
        // secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: maxTokenAge,
    });
}

module.exports = router;
