var assert = require('./common').assert,
    Browser = require('zombie');

Browser.localhost('mysite_akaidkwherethisnameisfrom', 3000);
const browser = new Browser();

describe('Login page', function() {
	before(function(done) {
    browser.visit('/login', done);
  });

  describe('simple get request', function() {
		it('should be successful', function() {
			browser.assert.success();
		});
	});
});

describe('Chat feature', function() {
	describe('prompt', function() {
		it('should be successful', function() {
			var result = false;
			browser.visit('/');
			browser.prompted('What is your name?');
			browser.assert.success();
		});
	});

	it('clears the textbox after pressing enter');

	it('adds a <p> element with the message');

	it('displays the correct username along with each message');
});

