var express = require('express'),
		app = express(),
		http = require('http').Server(app), // server
		io = require('socket.io')(http),
		bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(express.static(__dirname + '/public'));

require('./config/routes')(app); // routes for index and login page
require('./controllers/index_events')(io);

http.listen(3000, function() {
	console.log('listening on port 3000');
});