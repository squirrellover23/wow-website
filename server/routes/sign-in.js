const express = require("express");
const { db } = require("../database");
const uuid = require("uuid");

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
    console.log(req.body.password);
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
        res.redirect("/attendance-settings");
    } else {
        res.status(401).send("Unauthorized");
    }
});

function setAuthCookie(res, authToken) {
    res.cookie("token", authToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 604800000,
    });
}

module.exports = router;
