// Fisher-Yates shuffle algorithm
// Time complexity: O(n)
// Space complexity: O(n)

module.exports = function shuffle(cards) {
	var to_switch = cards.length - 1;

	while (to_switch != 0) {
		switch_with = Math.floor(Math.random() * to_switch);
		cards = swap(cards, to_switch, switch_with);
		to_switch--;
	}

	return cards;
}


function swap(list, first, second) {
	var temp = list[first];
	list[first] = list[second];
	list[second] = temp;
	return list;
}