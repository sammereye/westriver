var express = require('express');
var path    = require('path');
var mysql   = require('mysql');
var md5     = require('md5');
var moment  = require('moment');
var db      = require('../app/db');

// MySQL Database
var connection = mysql.createConnection({
    host    : db.host,
    user    : db.user,
    password: db.password,
    database: db.database
});

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
    connection.query('select s.firstName, s.lastName, c.courseName, d.departmentCode, c.courseID, section.startTime, section.endTime,  t.firstName as teacherFirstName, t.lastName as teacherLastName from student s, sectionEnrollment se, section, course c, department d, teacher t, teacherSection ts where s.studentID = se.studentID and se.sectionID = section.sectionID and section.courseID = c.courseID and c.departmentID = d.departmentID and t.teacherID = ts.teacherID and section.sectionID = ts.sectionID and s.username = "' + req.session.user + '"', (err, rows, fields) => {
        if (err) throw err;
        if (rows.length > 0) {
            firstName = rows[0].firstName;
            lastName = rows[0].lastName;
            var courses = [];
            var colors = ['#A63D40', '#E9B872', '#90A959', '#6494AA'];
            for(var i = 0; i < rows.length; i++) {
                var classDetails = {
                    courseName: rows[i].courseName,
                    departmentCode: rows[i].departmentCode,
                    courseID: rows[i].courseID,
                    startTime: rows[i].startTime,
                    endTime: rows[i].endTime,
                    teacher: rows[i].teacherFirstName + ' ' + rows[i].teacherLastName,
                    color: colors[i]
                };
                courses.push(classDetails);
            }
            

            var morning;
            if (moment().format('H') < 12) {
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

