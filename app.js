// web.js
var express = require("express");
var logfmt = require("logfmt");
var partials = require('express-partials');
var app = express();

app.set( 'view engine', 'ejs');
app.use( logfmt.requestLogger());
app.use( partials() );

// all routes are in routes/index.js
var routes = require('./controllers/routes')(app);

// server error handling
var errorHandler = require('./error-handler');
app.use( errorHandler );

app.use(express.static(__dirname + '/public'));

// Start server
var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});