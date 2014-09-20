// ERROR HANDLING

module.exports = function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!');
}