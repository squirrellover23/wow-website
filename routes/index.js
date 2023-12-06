var express = require('express');
const {db} = require('../database');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('/home.html');
});


router.post('/updatevisit', (req, res) => {
    const { firstName, lastName, action } = req.body;
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
                var error = true; 
                db.run("UPDATE names SET lastLoginTime = ?, visited = visited + 1 WHERE firstName = ? AND lastName = ?", [currentTime, firstName, lastName], (err) => {
                    if (err) {
                        res.status(500).send('Error updating last login time.');
                        error = false;
                    } 
                });
                const currentDate = new Date().toISOString();
                db.run("INSERT INTO login_logs (class, firstName, lastName, login_time) VALUES (?, ?, ?, ?)", [row.class, firstName, lastName, currentDate], (err) => {
                    if (err) {
                        res.status(500).send('Error loging visit.');
                        error = false
                    } 
                });
                if (error) {
                    res.status(200).json({visits: row.visited})
                }

            } else {
                res.status(429).send('You Already Logged For Today. Please try again later.');
            }
        }
    
    }); 
});
router.post('/addnewuser', (req, res) => {
    let { firstName, lastName, classIn } = req.body;
    firstName = firstName.trim()
    lastName = lastName.trim()
    classIn = classIn.trim()

    if (!firstName ||!lastName) {
        res.render('useradded', { message: `Please Enter a vaild Name` });
    } else if(!classIn){
        res.render('useradded', { message: `Please Enter a vaild Class` });
    }
    // Check if the user already exists in the database
    db.get("SELECT * FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err, row) => {
        if (err) {
            res.status(500).send('Error checking user existence.');
        } else if (row) {
            res.render('useradded', { message: `Failed to add: ${firstName} ${lastName}. User already exists.` });
        } else {
            // User doesn't exist, insert into the database
            db.run("INSERT INTO names (firstName, lastName, visited, class, lastLoginTime) VALUES (?, ?, 0, ?, 0)", [firstName, lastName, classIn], (err) => {
                if (err) {
                    res.status(500).send('Error adding the new user.');
                } else {
                    res.render('useradded', { message: `${firstName} ${lastName} added succesfully` });

                }
            });
        }
    });
});


function getUniqueValues(columnName, tableName, callback) {

    // SQLite query to get unique values
    const query = `SELECT DISTINCT ${columnName} FROM ${tableName}`;

    // Execute the query
    db.all(query, [], (err, rows) => {
        if (err) {
        callback(err, null);
        return;
        }

        // Extract unique values from the result
        const uniqueValues = rows.map(row => row[columnName]);

        // Return the unique values
        callback(null, uniqueValues);
    });
}

// Example usage


router.get('/adduser', (req, res) => {
    getUniqueValues('class', 'names', (err, result) => {
        if (err) {
            res.status(500).send('Error fetching class data.');
        }
        res.render('adduser', {classes: result});
    });
          
});


router.get('/viewusers', (req, res) => {
    db.all("SELECT firstName, lastName, visited, class FROM names", (err, rows) => {
        if (err) {
            res.status(500).send('Error fetching user data.');
        } else {
            res.render('viewusers', { users: rows});
        }
    });
});


router.post('/updatevisits', (req, res) => {
    const { firstName, lastName, visits } = req.body;
    db.run("UPDATE names SET visited = ? WHERE firstName = ? AND lastName = ?", [visits, firstName, lastName], (err) => {
        if (err) {
            res.status(500).send('Error updating the visit count.');
        } else {
            res.redirect('/viewusers'); // Redirect back to the "View Users" page
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


router.post('/deleteuser', (req, res) => {
    const { firstName, lastName } = req.body;
    db.run("DELETE FROM names WHERE firstName = ? AND lastName = ?", [firstName, lastName], (err) => {
        if (err) {
            res.status(500).send('Error deleting the user.');
        } else {
            res.redirect('/viewusers'); // Redirect back to the "View Users" page
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
        nextDay.setDate(nextDay.getDate() + 2);
        query += ` AND login_time <= ?`;
        params.push(`${nextDay.toISOString().split('T')[0]}`);
        console.log(`${nextDay.toISOString().split('T')[0]}`);

    }
  
    // Retrieve login attempts based on the query
    db.all(query, params, (err, rows) => {
        if (err) {  
            console.log('Query: ', query)
            console.error('Error retrieving login attempts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            getUniqueValues('class', 'names', (err, result) => {
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
