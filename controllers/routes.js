// ROUTES
// routes/index.js

var mapController = require("./map_controller");

module.exports = function (app) {

	app.get('/', function (req, res) {
		res.render('index');
	});

	app.get('/map', mapController.index);

	app.get('/map/:username', mapController.map);
}