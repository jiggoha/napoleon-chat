var app = require('express')(),
		express = require('express'),
		http = require('http').Server(app), // server
		io = require('socket.io')(http),
		bodyParser = require('body-parser'),
		MongoClient = require('mongodb').MongoClient,
    Cards = require('./cards_controller'),
    _  = require('underscore');

app.use(express.static(__dirname + '/public'));

var recent_messages = [];
var HISTORY_LENGTH = 10;
var usernames = [];
var hands = {};
var kitty = [];
var whose_turn;
var current_round = [];

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
				var init_msg = "Four players have joined. To start game, any player type '\\start game'.";
				io.emit('chat message', "!", init_msg);
			}
		})

		// deal
		socket.on('start game', function() {
			console.log('game started');

			db.collection('cards').find({}, { _id: false }).batchSize(52).toArray(function(err, cards) {
		    Cards.shuffle(cards);

		  	hands = Cards.deal(cards, usernames)[0];
      	kitty = Cards.deal(cards, usernames)[1];
      	
      	io.emit('first deal');
      	whose_turn = usernames[0];
      	// console.log("kitty: " + JSON.stringify(kitty, undefined, 2));
      	// console.log("hands: " + JSON.stringify(hands, undefined, 2));
			})

			// var game = {
			// 							napoleon: null,
			// 							secretary: null,
			// 							trump: null,
			// 							hands: hands,
			// 							kitty: kitty,
			// 							whose_turn: napoleon,
			// 							usernames: usernames,
			// 							current_round: current_round
			// 					 }

			io.emit('chat message', "!", "Declare bid, secretary, napoleon, and trump. E.g. '\\declare napoleon: valerie'");
		})

		// deal cards
		socket.on('ask for cards', function(username) {
			var cards = Cards.sort_hand(hands[username]);
			socket.emit('receive cards', cards);
		})

		// initialization of napoleon, secretary, trump
		socket.on('declare napoleon', function(username) {
			console.log("napoleon: " + username);			
		})
		socket.on('declare secretary', function(username) {
			console.log("secretary: " + username);			
		})
		socket.on('declare trump', function(trump) {
			console.log("trump: " + trump);
		})

		socket.on('play card', function(username, card_value) {
			if (whose_turn == username) {
				// updates whose_turn and current_round
				card = _.findWhere(hands[username], {value: card_value });
				whose_turn = Cards.next_turn(usernames, whose_turn);
				current_round.push(card);

				// announce play
				var play_msg = username + " played " + card.name;
				io.emit('chat message', "!", play_msg);

				// if the last person played, then determine winner
				if (current_round.length == 4) {
					var trump = "spades";
					var secretary = {
														"value" : "H1",
														"name" : "Ace of Hearts",
														"suit" : "hearts",
														"rank" : 1
													}

					var winning_card = Cards.who_wins(current_round, trump, secretary);
					console.log("winning_card: " + JSON.stringify(winning_card));

					var winning_player = usernames[current_round.indexOf(winning_card)];
					console.log("winning_player: " + winning_player);

					// announce win
					var win_msg = winning_player + " won with the " + winning_card.name;
					io.emit('chat message', "!", win_msg);

					whose_turn = winning_player;

					current_round = [];
				}

				// remove card from hand
				var card = _.findWhere(hands[username], { value: card_value });
				hands[username] = _.without(hands[username], card);

				socket.emit('remove card', card_value);
			} else {
				socket.emit('not your turn', whose_turn);
			}
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