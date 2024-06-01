const express = require("express");

var router = express.Router();

router.get("/", (req, res) => {
    res.render("sign-in");
});

router.post("/sign-in", (req, res) => {
    if (true) {
        console.log('Sucess')
        setAuthCookie(res, 'tokenvalue')
        res.redirect("/attendance-settings");
    } else {
        console.log('Failed')
        res.status(401).send("Unauthorized");
    }
});

function setAuthCookie(res, authToken) {
    res.cookie("token", authToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
    });
}

module.exports = router;



