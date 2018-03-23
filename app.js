var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var hbs         = require('hbs');
var session     = require('express-session');
var step        = require('step');

// HBS View engine
app.set('view engine', 'hbs');

// Initialize sessions
app.use(session({
    secret: 'mr roboto', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Body parser for POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// App routing
var router = require('./app/routes')
app.use('/', router);

// Import static files (Images / CSS)
app.use(express.static(__dirname + '/public'));

// Start server
var port = process.env.PORT || 80;
app.listen(port);

