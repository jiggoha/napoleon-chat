var app = require('express')(),
		http = require('http').Server(app), // server
		io = require('socket.io')(http),
		bodyParser = require('body-parser'),
		MongoClient = require('mongodb').MongoClient;

var recent_messages = [];
var HISTORY_LENGTH = 10;
var usernames = [];

MongoClient.connect('mongodb://localhost:27017/napoleon', function(err, db){
	'use strict';
	if (err) throw err;

	app.set('view engine', 'ejs');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.get('/', function(req, res) {
		res.render('index');
	});
	// not needed anymore because of prompt window
	// app.route('/login')
	// .get(function(req, res) {
	// 	res.render('login');
	// })
	// .post(function(req, res) {
	// 	var name = req.body.name;
	// 	usernames[] = name;
	// 	res.redirect('/');
	// })
	
	io.on('connection', function(socket) {
		console.log('a user connected');
		socket.emit('load previous messages', recent_messages);
		io.emit('show users', usernames);
		socket.emit('prompt username');

		socket.on('add username', function(username) {
			console.log("new username: " + username);

			socket.username = username;

			recent_messages.push(socket.username + " joined");
			clip(recent_messages);

			usernames.push(socket.username);

			io.emit('announce new user', socket.username);
			io.emit('show users', usernames);

			// if (usernames.length === 4) {
			// 	console.log('deal a hand');
			// }
		})

		socket.on('chat message', function(msg) {
			console.log(socket.username + ': ' + msg)

			recent_messages.push(socket.username + ": " + msg);
			clip(recent_messages);

			io.emit('chat message', socket.username, msg);
		})

		socket.on('is typing', function(username) {
			io.emit('display typing', username);
		})

		socket.on('not typing', function(username) {
			io.emit('remove typing', username);
		});

		socket.on('disconnect', function() {
			console.log(socket.username + ' disconnected');
			
			recent_messages.push(socket.username + " left");
			clip(recent_messages);

			usernames.splice(usernames.indexOf(socket.username),1) // delete username

			io.emit('user disconnected', socket.username);
			io.emit('show users', usernames);
		})
	})


	// keeps recent_messages array to be a certain length
	function clip(array) {
		if (array.length > HISTORY_LENGTH) {
			var howmany_extra = array.length - HISTORY_LENGTH;
			return array.splice(0, howmany_extra);
		} else {
			return array;
		}
	}

	http.listen(3000, function() {
		console.log('listening on port 3000');
	})
})