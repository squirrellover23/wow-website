var express = require('express');
const {db} = require('../database');
const {send_email} = require('../email_control')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    db.all("SELECT * FROM classes WHERE registered = 0", (err, classes) => {
        if(err){
            res.status(500).send('Error Getting Classes');
        } else {
            res.render('login-settings', {classes: classes});
        }
    })
});



router.post('/addnewuser', (req, res) => {
    let { firstName, lastName, classIn } = req.body;
    firstName = firstName.trim()
    lastName = lastName.trim()
    classIn = classIn.trim()

    if (!firstName ||!lastName) {
        res.render('useradded', { message: `Please Enter a vaild Name` });
        return;
    } else if(!classIn){
        res.render('useradded', { message: `Please Enter a vaild Class` });
        return;
    }
    // Check if the user already exists in the database
    db.get("SELECT * FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err, row) => {
        if (err) {
            res.status(500).send('Error checking user existence.');
        } else if (row) {
            res.render('useradded', { message: `Failed to add: ${firstName} ${lastName}. User already exists.` });
        } else {
            // User doesn't exist, insert into the database
            db.run("INSERT INTO names (firstName, lastName, class) VALUES (?, ?, ?)", [firstName, lastName, classIn], (err) => {
                if (err) {
                    res.status(500).send('Error adding the new user.');
                } else {
                    res.render('useradded', { message: `${firstName} ${lastName} added succesfully` });

                }
            });
        }
    });
});


router.get('/adduser', (req, res) => {
    db.all('SELECT * FROM classes WHERE registered = 1', (err, classes) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        } 
        res.render('adduser', { classes: classes });   
    });
});


router.get('/viewusers', (req, res) => {
    db.all("SELECT firstName, lastName, visits_since_vouch, class FROM names", (err, rows) => {
        if (err) {
            res.status(500).send('Error fetching user data.');
        } else {
            res.render('viewusers', { users: rows});
        }
    });
});



router.get('/classes', (req, res) => {
    db.all('SELECT * FROM classes WHERE registered = 1', (err, registeredClasses) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        // Fetch unregistered classes from the database
        db.all('SELECT * FROM classes WHERE registered = 0', (err, unregisteredClasses) => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }

            // Render the EJS template with registered and unregistered classes
            res.render('classes', { registeredClasses, unregisteredClasses });
        });
    });
});

// Route to handle the form submission and add a new class
router.post('/add-class', (req, res) => {
    const className = req.body.className;
    const registered = req.body.registered === 'true'; // Convert string to boolean

    // Check if the class already exists
    db.get('SELECT * FROM classes WHERE className = ?', [className], (err, existingClass) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        // If the class already exists, redirect back to the class list page
        if (existingClass) {
            res.redirect('/classes');
        } else {
            // Insert the new class into the database
            const query = 'INSERT INTO classes (className, registered) VALUES (?, ?)';
            db.run(query, [className, registered], (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                // Redirect back to the class list page after adding the class
                res.redirect('/classes');
            });
        }
    });
});
router.post('/updatevisits', (req, res) => {
    const { firstName, lastName, visits } = req.body;
    db.run("UPDATE names SET visits_since_vouch = ? WHERE firstName = ? AND lastName = ?", [visits, firstName, lastName], (err) => {
        if (err) {
            res.status(500).send('Error updating the visit count.');
        } else {
            res.redirect('/viewusers'); // Redirect back to the "View Users" page
        }
    });
});


router.post('/givevoucher', (req, res) => {
    const { firstName, lastName } = req.body;
    db.run("UPDATE names SET visits_since_vouch = visits_since_vouch - 16, vouchers_received = vouchers_received + 1 WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err) => {
        if (err) {
            res.status(500).send('Error updating the visit count.');
        } else {
            const currentDate = new Date().toISOString();
            db.run("INSERT INTO vouchers_given (firstName, lastName, time_given) VALUES (?, ?, ?)", [firstName, lastName, currentDate], (err) => {
                if (err){
                    res.status(500).send('Error logging voucher info.');
                } else {
                    res.redirect('/viewusers');
                }
            });
        }
    });
});


router.post('/checkuser', (req, res) => {
    const { firstName, lastName } = req.body;
    db.get("SELECT * FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err, row) => {
        if (err) {
            res.status(500).send('Error checking user existence.');
        } else if (!row) {
            res.status(401).send('Invalid user information.');
        } else {
            res.status(200).send('User exists in db')
        }
    });
});


router.get('/user/:firstName/:lastName', (req, res) => {
    const { firstName, lastName } = req.params;
  
    // Query the database to get user information
    const query = "SELECT * FROM names WHERE firstName = ? AND lastName = ?";
    db.get(query, [firstName, lastName], (err, userRow) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (userRow) {
            const loginQuery = 'SELECT class, login_time FROM login_logs WHERE firstName = ? AND lastName = ?';
            db.all(loginQuery, [firstName, lastName], (err, loginRows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).send('Internal Server Error');
                } else {
                    const voucherQuery = 'SELECT time_given FROM vouchers_given WHERE firstName = ? AND lastName = ?';
                    db.all(voucherQuery, [firstName, lastName], (err, voucherRows) => {
                        if (err) {
                        console.error(err.message);
                        res.status(500).send('Internal Server Error');
                        return;
                        }

                        // Render the EJS template with user, login, and voucher information
                        res.render('userinfo', { user: userRow, logins: loginRows, vouchers: voucherRows });
                    });
                }
            });
        } else {
            // User not found
            res.status(404).send('User not found');
        }
    });
});


router.post('/deleteuser', (req, res) => {
    const { firstName, lastName } = req.body;
    db.run("DELETE FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err) => {
        if (err) {
            res.status(500).send('Error deleting the user.');
        } else {
            db.run("DELETE FROM login_logs WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err) => {
                if (err) {
                    res.status(500).send('Error deleting the user.');
                } else {
                    res.redirect('/viewusers'); // Redirect back to the "View Users" page
                }
            });
            
        }
    });
});

router.post('/deleteclass', (req, res) => {
    const { className } = req.body;
    db.run("DELETE FROM classes WHERE className = ?", [className], (err) => {
        if (err) {
            res.status(500).send('Error deleting the class.');
        } else {
            res.redirect('/classes');
        }
    });
});



router.get('/login-attempts', (req, res) => {
    // Check if user_id, start date, and end date are provided in the query parameters
    const { user_id, user_class, startDate, endDate } = req.query;
    let query = 'SELECT * FROM login_logs WHERE 1=1'; // 1=1 for dynamic WHERE clause building
    const params = [];

    // If user_id is provided, filter by user_id
    if (user_id) {
      query += ' AND firstName = ? AND lastName = ?';
      params.push.apply(params, user_id.split(' '));
    }
    // If class is provided, filter by class
    if (user_class) {
        query += ' AND class = ?';
        params.push(user_class);
    }
  
    // If start and end dates are provided, filter by that date range
    if (startDate) {
        query += ` AND login_time >= ?`;
        params.push(startDate)
    }

    if (endDate) {
        // Adjust the endDate to be inclusive by adding one day
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query += ` AND login_time <= ?`;
        params.push(`${nextDay.toISOString().split('T')[0]}`);

    }
  
    // Retrieve login attempts based on the query
    db.all(query, params, (err, rows) => {
        if (err) {  
            console.error('Error retrieving login attempts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            db.all('SELECT * FROM classes', (err, result) => {
                if (err) {
                    res.status(500).send('Error fetching class data.');
                }
                res.render('login-attempts', { loginAttempts: rows, user_id, user_class, startDate, endDate, classes: result });
            });
            // Render the login attempts page and pass the login attempts data to the view
        }
    });
  });
  
  


module.exports = router;
