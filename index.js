var app = require('express')(),
		http = require('http').Server(app), // server
		io = require('socket.io')(http),
		bodyParser = require('body-parser');

var usernames = {};

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}))

app.get('/', function(req, res) {
	res.render('index');
});

app.route('/login')
.get(function(req, res) {
	res.render('login');
})
.post(function(req, res) {
	var name = req.body.name;
	// usernames[] = name;
	res.redirect('/');
})

io.on('connection', function(socket) {
	console.log('a user connected');
	io.emit('user connected');

	socket.on('chat message', function(msg) {
		console.log(socket.username + ': ' + msg)
		io.emit('chat message', socket.username, msg);
	})

	socket.on('add username', function(username) {
		socket.username = username;
		console.log("new username: " + socket.username);
	})

	socket.on('disconnect', function() {
		console.log(socket.username + ' disconnected');
		io.emit('user disconnected', socket.username);
	})
})

http.listen(3000, function() {
	console.log('listening on port 3000');
})