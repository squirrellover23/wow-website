const express = require("express");
const { db } = require("../database");

var router = express.Router();

router.use("*", (req, res, next) => {
    const authToken = req.cookies["token"];
    db.get(
        "SELECT 1 FROM auth_tokens WHERE token = ? LIMIT 1;",
        [authToken],
        (err, row) => {
            if (err) {
                console.error(err);
            } else if (row) {
                next();
            } else {
                res.redirect("/");
            }
        }
    );
});
module.exports = router;
