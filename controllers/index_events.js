var MongoClient = require('mongodb').MongoClient,
		Cards = require('../helpers/cards'),
		Pretty = require('../helpers/client'),
    _  = require('underscore');

function declare_secretary(game, usernames, card_value) {
	game.secretary_card = _.findWhere(game.cards, { value: card_value });

	// who holds the secretary card
	for (var i=0; i < usernames.length; i++) {
		if (_.findWhere(game.hands[usernames[i]], game.secretary_card)) {
			game.secretary_player = usernames[i];
			break;
		}
	}

	console.log("secretary card: " + JSON.stringify(game.secretary_card));
	console.log("secretary player: " + game.secretary_player);
}

module.exports = function(io) {
	var recent_messages = [];
	var usernames = [];
	var game = {
		napoleon: null,
		secretary_player: null,
		secretary_card: null,
		trump: null,
		cards: [],
		hands: {}, // probably overwriting something right now
		kitty: [],
		whose_turn: null,
		points: {},
		bid: 0,
		current_round: []
	};

	// events
	io.on('connection', function(socket) {
		console.log('a user connected');
		socket.emit('load previous messages', recent_messages);
		io.emit('show users', usernames);
		socket.emit('prompt username');

		// deal
		socket.on('start game', function(napoleon, secretary_card, bid, trump) {
			console.log('game started');

			game.napoleon = game.whose_turn = napoleon;
			game.bid = bid;
			game.trump = trump;

			for (var i = 0; i < usernames.length; i++) {
				game.points[usernames[i]] = 0;
			}

			declare_secretary(game, usernames, secretary_card);

			io.emit('display game info', napoleon, secretary_card, bid, trump);
		});

		socket.on('tell everyone to ask for cards', function() {
			MongoClient.connect('mongodb://localhost:27017/napoleon', function(err, db) {
				'use strict';
				if (err) throw err;

				// return all cards without _id field
				db.collection('cards').find({}, { _id: false }).batchSize(52).toArray(function(err, cards) {
					game.cards = cards;		    

			    Cards.shuffle(cards);

			  	game.hands = Cards.deal(cards, usernames)[0];
			  	game.kitty = Cards.deal(cards, usernames)[1];
			  	
			  	console.log("kitty: " + JSON.stringify(game.kitty));
			  	console.log("hands: " + JSON.stringify(game.hands, undefined, 2));

			  	db.close();

					io.emit('first deal');
				});
			});
		});

		socket.on('tell everyone to remove deal button', function() {
			io.emit('remove deal button');
		});

		socket.on('tell everyone to remove start button', function() {
			io.emit('remove start button');
		});

	  // associates a new socket with the username that the user inputted
		socket.on('add username', function(username) {
			console.log("new username: " + username);

			socket.username = username;

			recent_messages.push(socket.username + " joined");
			Pretty.clip(recent_messages);

			usernames.push(socket.username);

			io.emit('announce new user', socket.username);
			io.emit('show users', usernames);

			if (usernames.length === 4) {
				var init_msg = "Four players have joined. To start a game, any player can click on the 'start game' button.";
				io.emit('chat message', "!", init_msg);

				io.emit('allow start game');
			}
		})

		// deal cards
		socket.on('ask for cards', function(username) {
			var cards = Cards.sort_hand(game.hands[username]);
			socket.emit('receive cards', cards);
		});

		socket.on('play card', function(username, card_value) {
			if (game.whose_turn == username) {
				// updates whose_turn and current_round
				card = _.findWhere(game.hands[username], { value: card_value });
				game.whose_turn = Cards.next_turn(usernames, game.whose_turn);
				
				var player_card = { username: username, card_played: card };
				game.current_round.push(player_card);

				// announce play
				var play_msg = username + " played " + card.name;
				io.emit('chat message', "!", play_msg);

				// if the last person played, then determine winner
				if (game.current_round.length == 4) {
					console.log("current round: " + JSON.stringify(game.current_round));
					var winning_player_card = Cards.who_wins(game.current_round, game.trump, game.secretary_card);
					var winning_player = winning_player_card.username;
					console.log("winning_card: " + JSON.stringify(winning_player_card));

					// announce win
					var win_msg = winning_player + " won with the " + winning_player_card.card_played.name;
					io.emit('chat message', "!", win_msg);

					// track points
					Pretty.calculate_points(game, winning_player, function() {
						game.current_round = [];
					})

					var napoleon_team_points = game.points[game.napoleon] + game.points[game.secretary_player];
					var defending_team = _.without(usernames, game.napoleon, game.secretary_player)
					var defending_team_points = game.points[defending_team[0]] + game.points[defending_team[1]];
					if (napoleon_team_points > game.bid) {
						console.log('napoleon wins');
						io.emit('chat message', '!', game.napoleon + " and " + game.secretary_player + " won with " + napoleon_team_points + " points.");
					} else if (16 - defending_team_points < game.bid) {
						console.log('napoleon loses');
						io.emit('chat message', '!', game.napoleon + " and " + game.secretary_player + " lost. " + defending_team[0] + " and " + defending_team[1] + " took " + defending_team_points + " points.");
					}

					game.whose_turn = winning_player;
				}

				// remove card from hand
				var card = _.findWhere(game.hands[username], { value: card_value });
				game.hands[username] = _.without(game.hands[username], card);

				socket.emit('remove card', card_value);
			} else {
				socket.emit('not your turn', game.whose_turn);
			}
		});

	  // a user sends a chat message to everyone
		socket.on('chat message', function(msg) {
			console.log(socket.username + ': ' + msg)

			recent_messages.push(socket.username + ": " + msg);
			Pretty.clip(recent_messages);

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
			Pretty.clip(recent_messages);

			usernames.splice(usernames.indexOf(socket.username), 1) // delete username

			io.emit('user disconnected', socket.username);
			io.emit('show users', usernames);
		})
	})
}