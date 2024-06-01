var express = require("express");
var router = express.Router();
const { send_email } = require("../email_control");

// Test Features under development


/* GET users listing. */
router.get("/email", function (req, res, next) {
    send_email(
        "petersonwingate@gmail.com",
        "test email",
        "yess!!! yes yes yes!! http://localhost:3000"
    );

    res.send("test email");
});

module.exports = router;
