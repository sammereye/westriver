var express = require('express');
var path    = require('path');
var mysql   = require('mysql');
var md5     = require('md5');
var moment  = require('moment');

// MySQL Database
var connection = mysql.createConnection({
    host    : 'tuy8t6uuvh43khkk.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user    : 'o0wdocclagvg9k7q',
    password: 'uy07rcnni22z287t',
    database: 'hsu76hksxijpvpse'
});

connection.connect();

// Create router object
var router = express.Router();
var status;

// Export router object to app.js
module.exports = router;

router.get('/westriver', (req, res) => {
    var error = req.session.error;
    res.render('index.hbs', {
        error: error
    });
    delete req.session.error;
});

router.get('/westriver/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('../westriver');
    }

    var firstName, lastName;
    connection.query('select s.firstName, s.lastName, c.courseName from student s, sectionEnrollment se, section, course c where s.studentID = se.studentID and se.sectionID = section.sectionID and section.courseID = c.courseID and s.username = "' + req.session.user + '"', (err, rows, fields) => {
        if (err) throw err;
        if (rows.length > 0) {
            firstName = rows[0].firstName;
            lastName = rows[0].lastName;
            var courses = [];
            for(var i = 0; i < rows.length; i++) {
                var classDetails = {
                    courseName: rows[i].courseName
                };
                courses.push(classDetails);
            }
            

            var morning;
            if (moment().format('H') <= 12) {
                morning = true;
            } else {
                morning = false;
            }
            res.render('dashboard.hbs', {
                morning: morning,
                firstName: firstName,
                lastName: lastName,
                courses: courses
            });
            
        } else {
            delete req.session.user;
            res.redirect('../westriver');
        }
    });
});

router.post('/westriver/verify', (req, res) => {
    if (req.body.username && req.body.password) {
        connection.query('select username, password from student where username = "' + req.body.username + '"', (err, rows, fields) => {
            if (err) throw err;
            if (rows.length > 0) {
                if (md5(req.body.password) == rows[0].password) {
                    req.session.user = rows[0].username;
                    res.redirect('/westriver/dashboard');
                } else {
                    status = "incorrectPassword";
                    redirect(status);
                }
            } else {
                status = "incorrectUser";
                redirect(status);
            }
        });
    }
    function redirect(status) {
        req.session.error = status;
        res.redirect('/westriver');
    }
});
