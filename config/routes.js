module.exports = function(app) {
	// the main chatroom
	app.get('/', function(req, res) {
		res.render('index');
	});

	app.get('/login', function(req, res) {
		res.render('login');
	});
}