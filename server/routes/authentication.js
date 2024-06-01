const express = require("express");

var router = express.Router();

router.use("*", function (req, res, next) {
    console.log("authenticating");
    const authToken = req.cookies['token'];

    if (authToken) {
        console.log('have token')
        next();
        
    } else {
        console.log('no token')
        res.redirect('/')
    }
});

module.exports = router;
