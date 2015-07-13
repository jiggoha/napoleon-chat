const HISTORY_LENGTH = 10;

// keeps recent_messages array to be a certain length
module.exports.clip = function clip(array) {
  if (array.length > HISTORY_LENGTH) {
    var howmany_extra = array.length - HISTORY_LENGTH;
    return array.splice(0, howmany_extra);
  } else {
    return array;
  }
}

module.exports.calculate_points = function calculate_points(game, winning_player, clear_current_round) {
	console.log(JSON.stringify(game));
	console.log(game);

	for (var i = 0; i < game.current_round.length; i++) {
		console.log("rank" + i + ": " + game.current_round[i].card_played.rank)
		if (game.current_round[i].card_played.rank > 10) {
			game.points[winning_player] += 1;
		}
	}
	console.log(JSON.stringify(game.points));

	clear_current_round();
}