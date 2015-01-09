var app = require('express')(),
		http = require('http').Server(app); // server
		io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index');
});

io.on('connection', function(socket) {
	console.log('a user connected');
	io.emit('user connected');

	socket.on('chat message', function(msg) {
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	})

	socket.on('disconnect', function() {
		console.log('user disconnected');
		io.emit('user disconnected');
	})
})

http.listen(3000, function() {
	console.log('listening on port 3000');
})