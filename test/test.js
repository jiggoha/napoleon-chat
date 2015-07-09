var assert = require("assert");
var Cards = require("../cards_controller");
MongoClient = require('mongodb').MongoClient;
var _ = require("underscore");

describe('Cards controller', function() {
  var cards;
  var in_order;

	before(function(done) {
		MongoClient.connect('mongodb://localhost:27017/napoleon', function(err, db){
			if (err) throw err;

			db.collection('cards').find({}, { _id: false }).batchSize(52).toArray(function(err, unshuffled) {
				cards = unshuffled;
				in_order = unshuffled.slice(); // make copy
		  });

		  done();
		});
	})

  describe('#shuffle(cards)', function() {
  	// this is kind of a weird test
  	it('should not return the same hand', function() {

  		for (i = 0; i < 12; i++) {
	  		first_before = JSON.stringify(cards[i]);
	  		Cards.shuffle(cards);
	  		first_after = JSON.stringify(cards[i]);

	  		assert.notEqual(first_before, first_after);
  		}
  	});

  	it('should contain 52 cards', function() {
  		assert.equal(cards.length, 52);
  	})

  	it('should contain all unique cards', function() {
  		cards =  _.sortBy(cards, "rank");

  		for (i = 0; i < 1; i++) {
  			var match = _.isEqual(cards[i], cards[i+1]);
  			assert.equal(match, 0);
  		}
  	})

  	after(function() {
  		Cards.shuffle(cards)
  	});
	});

	describe('#deal(cards, usernames)', function() {
		var usernames = ["a", "b", "c", "d"];
		var hands;
		var kitty;
		before(function(done) {
			result = Cards.deal(cards, usernames);
			hands = result[0];
			kitty = result[1];
			done();
		})

		it('should return 12 cards for each of the 4 usernames', function() {
			for (i = 0; i < 4; i++) {
				assert.equal(hands[usernames[i]].length, 12);
			}
		});

		it('should return 4 cards for the kitty', function() {
			assert.equal(kitty.length, 4);
		});

		it('should not give the same card to more than one person/kitty', function() {
			for (i = 0; i < 52; i++) {
	  		var in_hands = 0;

	  		for (j = 0; j < 4; j++) {
	  			for (k = 0; k < 12; k++) {
	  				if (JSON.stringify(hands[usernames[j]][k]) == JSON.stringify(in_order[i])) {
	  					in_hands += 1;
	  				}
	  			}
	  		}

	  		for (j = 0; j < 4; j++) {
	  			if (kitty[j] == in_order[i]) {
	  				in_hands += 1;
	  			}
	  		}

	  		assert.equal(in_hands, 1);
	  	}
		});
	});

// module.exports.swap in cards_controller.js is commented out so this is commented out
	// describe('#swap(list, first, second)', function () {
 //    it('should switch two elements in a list', function () {
 //      assert.equal(JSON.stringify([1,2,3,4,5]),
 //      						 JSON.stringify(Cards.swap([1,2,3,4,5], 2, 2)));
 //    });
 //  });

	describe('#merge(list1, list2)', function() {
		it('should combine two ordered list to produce a bigger ordered list', function() {
			assert.equal(_.isEqual([1,2,3], Cards.merge([],[1,2,3])), 1);

			assert.equal(_.isEqual([1,2,3,4], Cards.merge([3,4],[1,2])), 1);

			assert.equal(_.isEqual([{"value":1}, {"value":2}, {"value":3}, {"value":4}], Cards.merge([{value: 1},{value: 2}], [{value: 3},{value: 4}])), 1);
		});
	});
});