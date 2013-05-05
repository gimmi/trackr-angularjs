var http = require('http');
var app = require('./server');

describe('server', function () {
	var server, sockets;

	beforeEach(function (done) {
		sockets = [];

		server = http.createServer(app);
		server.listen(8090, function () { done(); });
		server.on('connection', function (socket) { sockets.push(socket); });
	});

	afterEach(function (done) {
		sockets.forEach(function (socket) { socket.end(); });
		server.close(function () { done(); });
	});

	it('should get all items', function (done) {
		request('http://localhost:8090/api/items', function (statusCode, json) {
			expect(statusCode).toBe(200);
			expect(json).toEqual(jasmine.any(Array));
			expect(json.length).toEqual(3);

			done();
		});
	});

	function request(options, callback) {
		http.request(options, function (res) {
			var output = '';

			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				output += chunk;
			});

			res.on('end', function() {
				callback(res.statusCode, JSON.parse(output));
			});
		}).end();
	}
});
