var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var ioMiddleware = require('socketio-wildcard')();
io.use(ioMiddleware);

var SIMULATOR_ENABLE = true;
const SIMULATOR_DELAY = 1000;
//var LOG_RECEIVE_FROM_DEVICE_EVENT = 'device-logs';
var LOG_RECEIVE_FROM_DEVICE_EVENT = '*';
var LOG_PUBLISH_TO_WEB_CLIENT_EVENT = 'published-logs';

var port = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(port, function () {
	console.log('Socket Server listening at port %d', port);
});


io.on('connection', function (socket) {
	console.log('A Client has been Connected!!');

	socket.on(LOG_RECEIVE_FROM_DEVICE_EVENT, function (data) {
		console.log('Request received!', data);
		socket.broadcast.emit(LOG_PUBLISH_TO_WEB_CLIENT_EVENT, data);
	});

	socket.on('disconnect', function () {
		console.log('A Client has been Disconnected!');
		socket.broadcast.emit('disconnected', {});
	});

	// Simulator
	(() => {
		if (SIMULATOR_ENABLE) {
			console.log('Simulating logs...');
			var count = 0;
			setInterval(() => {
				socket.broadcast.emit(LOG_PUBLISH_TO_WEB_CLIENT_EVENT, { data: 'Simulated Data!', count: ++count });
			}, SIMULATOR_DELAY);
		}
	})();
});

