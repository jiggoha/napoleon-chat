var app = require('express')(),
		http = require('http').Server(app), // server
		io = require('socket.io')(http),
		bodyParser = require('body-parser'),
		MongoClient = require('mongodb').MongoClient,
    Cards = require('./cards_controller'),
    _  = require('underscore');

var recent_messages = [];
var HISTORY_LENGTH = 10;
var usernames = [];
var hands = {};
var kitty = [];

// keeps recent_messages array to be a certain length
function clip(array) {
  if (array.length > HISTORY_LENGTH) {
    var howmany_extra = array.length - HISTORY_LENGTH;
    return array.splice(0, howmany_extra);
  } else {
    return array;
  }
}

MongoClient.connect('mongodb://localhost:27017/napoleon', function(err, db){
	'use strict';
	if (err) throw err;

	app.set('view engine', 'ejs');
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}))

  // the main chatroom
	app.get('/', function(req, res) {
		res.render('index');
	});

	// deck
	
	io.on('connection', function(socket) {
		console.log('a user connected');
		socket.emit('load previous messages', recent_messages);
		io.emit('show users', usernames);
		socket.emit('prompt username');

    // associates a new socket with the username that the user inputted
		socket.on('add username', function(username) {
			console.log("new username: " + username);

			socket.username = username;

			recent_messages.push(socket.username + " joined");
			clip(recent_messages);

			usernames.push(socket.username);

			io.emit('announce new user', socket.username);
			io.emit('show users', usernames);

			if (usernames.length === 4) {
			  db.collection('cards').find().batchSize(52).toArray(function(err, cards) {
			    Cards.shuffle(cards);

			  	hands = Cards.deal(cards, usernames)[0];
        	kitty = Cards.deal(cards, usernames)[1];
        	
        	io.emit('first deal');
        	// console.log("kitty: " + JSON.stringify(kitty, undefined, 2));
        	// console.log("hands: " + JSON.stringify(hands, undefined, 2));
			  })
			}
		})

		socket.on('ask for cards', function(username) {
			var cards = Cards.sort_hand(hands[username]);
			socket.emit('receive cards', cards);
		})

		socket.on('play card', function(username, card_value) {
			var card = _.findWhere(hands[username], { value: card_value});
			hands[username] = _.without(hands[username], card);

			console.log("after: " + JSON.stringify(hands[username]));
		})

    // a user sends a chat message to everyone
		socket.on('chat message', function(msg) {
			console.log(socket.username + ': ' + msg)

			recent_messages.push(socket.username + ": " + msg);
			clip(recent_messages);

			io.emit('chat message', socket.username, msg);
		})

    // "{user} is typing" functionality
		socket.on('is typing', function(username) {
			io.emit('display typing', username);
		})
		socket.on('not typing', function(username) {
			io.emit('remove typing', username);
		});

    // remove a user after they have disconnected, and announce removal
		socket.on('disconnect', function() {
			console.log(socket.username + ' disconnected');
			
			recent_messages.push(socket.username + " left");
			clip(recent_messages);

			usernames.splice(usernames.indexOf(socket.username),1) // delete username

			io.emit('user disconnected', socket.username);
			io.emit('show users', usernames);
		})
	})

	http.listen(3000, function() {
		console.log('listening on port 3000');
	})
})