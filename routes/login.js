var express = require('express');
const {db} = require('../database');
const {send_email} = require('../email_control')

var router = express.Router();


router.get('/', function(req, res) {
    const {classChosen} = req.query;
    console.log(classChosen);
    res.render('login-page', {defa: classChosen === 'registered', classs: classChosen});
    
});


router.post('/updateregvisit', (req, res) => {
    const { firstName, lastName } = req.body;
    db.get("SELECT * FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err, row) => {
        if (err) {
            res.status(500).send('Error checking user existence.');
        } else if (!row) {
            res.status(401).send('Invalid user information.');
        } else {
            const lastLoginTime = row.lastLoginTime || 0;
            const currentTime = Date.now();

            if (currentTime - lastLoginTime >= 10 * 3600 * 1000) {
                // User can log in (it's been at least 5 minutes)
                // Update the last login time
                //AND SET visited = visited + 1
                var no_error = true; 
                db.run("UPDATE names SET lastLoginTime = ?, total_visits = total_visits + 1, enrolled_class_visits = enrolled_class_visits + 1, visits_since_vouch = visits_since_vouch + 1 WHERE firstName = ? AND lastName = ?", [currentTime, firstName, lastName], (err) => {
                    if (err) {
                        res.status(500).send('Error updating last login time.');
                        no_error = false;
                    } 
                });
                const currentDate = new Date().toISOString();
                if (no_error){
                    db.run("INSERT INTO login_logs (class, firstName, lastName, login_time) VALUES (?, ?, ?, ?)", [row.class, firstName, lastName, currentDate], (err) => {
                        if (err) {
                            res.status(500).send('Error loging visit.');
                            no_error = false
                        } 
                    });
                }
                if (no_error) {
                    // email if
                    if(row.visits_since_vouch + 1 == 15){
                        send_email('petersonwingate@gmail.com', 'website test', `User ${firstName} ${lastName} has reached 15 visits and will soon need a voucher. http://localhost:3000/user/${firstName}/${lastName}`)
                    }
                    res.status(200).json({visits: row.visits_since_vouch + 1})

                }

            } else {
                res.status(429).send('You Already Logged For Today. Please try again later.');
            }
        }
    
    }); 
});


router.post('/unreg-visit', (req, res) => {
    const { firstName, lastName, classIn } = req.body;
    db.get("SELECT * FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err, row) => {
        if (err) {
            res.status(500).send('Error checking user existence.');
        } else if (!row) {
            res.status(401).send('Invalid user information.');
        } else {
            // change this so that you can only go to a class once a day
            const lastLoginTime = 0;
            const currentTime = Date.now();
            let no_error = true;
            if (currentTime - lastLoginTime >= 10 * 3600 * 1000) {
                // User can log in (it's been at least 5 minutes)
                db.run("UPDATE names SET total_visits = total_visits + 1 WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err) => {
                    if (err) {
                        res.status(500).send('Error updating last login time.');
                        no_error = false;
                    } 
                });
                const currentDate = new Date().toISOString();
                if (no_error) {
                    db.run("INSERT INTO login_logs (class, firstName, lastName, login_time) VALUES (?, ?, ?, ?)", [classIn, firstName, lastName, currentDate], (err) => {
                        if (err) {
                            res.status(500).send('Error loging visit.');
                            no_error = false;
                        } 
                    });
                }
                if (no_error) {
                    res.status(200).json({visits: 0})
                }

            } else {
                res.status(429).send('You Already Logged For Today. Please try again later.');
            }
        }
    
    }); 
});


module.exports = router;
