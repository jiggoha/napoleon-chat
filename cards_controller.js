// Fisher-Yates shuffle algorithm
// Time complexity: O(n)
// Space complexity: O(n)
module.exports.shuffle = function shuffle(cards) {
	var to_switch = cards.length - 1;

	while (to_switch != 0) {
		switch_with = Math.floor(Math.random() * to_switch);
		cards = swap(cards, to_switch, switch_with);
		to_switch--;
	}

	return cards;
}

// sort a hand by suite and rank
module.exports.sort_hand = function mergesort(list) {
	if (list.length > 1) {
		var list1 = list.slice(0, Math.floor(list.length/2));
		var list2 = list.slice(Math.floor(list.length/2)); // the rest
		list1 = mergesort(list1);
		list2 = mergesort(list2);
		return merge(list1, list2);
	} else {
		return list;
	}
}

// sort helper
function merge(list1, list2) {
	var sorted_result = [];

	while ((list1.length != 0) && (list2.length != 0)) {
		if (list1[0].value < list2[0].value) {
			// if the last element of list1 < last element of list2, append it
			sorted_result.push(list1.shift());
		} else {
			// otherwise, append the last element of list2
			sorted_result.push(list2.shift());
		}
	}

	if (list1.length == 0) {
		// if list1 empty, then add the rest of list2
		sorted_result = sorted_result.concat(list2);
	} else if (list2.length == 0) {
		// if list2 empty, then add the rest of list1
		sorted_result = sorted_result.concat(list1);
	}

	return sorted_result;
}

function swap(list, first, second) {
	var temp = list[first];
	list[first] = list[second];
	list[second] = temp;
	return list;
}


// assign people (owners) to cards and set aside kitty
module.exports.deal = function deal(cards, usernames) {
	var hands = {};
  var kitty = cards.splice(0, 4);

  for (i = 0; i < 4; i++) {
    for (j = 0; j < 12; j++) {
      if (hands[usernames[i]]) {
      	// this is kind of hacky: should fix later.
      	// +12*i is to increment index of cards to assign different 12 cards for each player
        hands[usernames[i]].push(cards[j+12*i]);
      } else {
      	// this is the initialization
        hands[usernames[i]] = [cards[j+12*i]];
      }
    }
  }
  return [hands, kitty];
}


module.exports.who_wins = function who_wins(trick, trump, secretary) {
	var lead = trick[0];
	var winning = lead; // assume lead is winning

	// if the secretary leads with the secretary card
	if (JSON.stringify(lead) === JSON.stringify(secretary)) {
		return lead;
	}

	for (i = 1; i < 4; i++) {
		// if secretary is played, it beats everything
		if (JSON.stringify(trick[i]) === JSON.stringify(secretary)) {
			winning = trick[i];
			break
		}

		// trump beats whatever is winning if winning is not trump
		if ((winning.suit != trump) && (trick[i].suit === trump)) {
			winning = trick[i];
		}

		// check if the next card played is the same suit and ranked higher
		if ((winning.suit === trick[i].suit) && (winning.rank < trick[i].rank)) {
			winning = trick[i];
		}
	}

	return winning;
}





