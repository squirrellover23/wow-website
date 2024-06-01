const express = require("express");
const uuid = require("uuid");

// token: uuid.v4();
const password = "hello";

var router = express.Router();

router.get("/", (req, res) => {
    const authToken = req.cookies["token"];

    if (authToken && checkToken(authToken)) {
        res.redirect("/attendance-settings");
    } else {
        res.render('sign-in')
    }
    
});

router.post("/sign-in", (req, res) => {
    if (req.body.password) {
        setAuthCookie(res, "tokenvalue");
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
    });
}

function checkToken(token) {
    
}


module.exports = router;
