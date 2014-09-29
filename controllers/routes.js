// ROUTES
// routes/index.js

var mapController = require("./map_controller");

module.exports = function (app) {

	app.get('/', mapController.index);

	//app.get('/map', mapController.index);

	app.get('/:username', mapController.index);
}