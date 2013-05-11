var http = require('http');
var mongoose = require('mongoose');
var app = require('./server');

describe('server', function () {
	var server, sockets;

	beforeEach(function (done) {
		sockets = [];

		server = http.createServer(app);

		mongoose.connect('mongodb://localhost/trackr_tests', function (err) {
			if (err) { done(err); return; }

			server.listen(8090, function () { done(); });
		});

		server.on('connection', function (socket) { sockets.push(socket); });
	});

	afterEach(function (done) {
		mongoose.connection.db.dropDatabase();
		mongoose.disconnect();

		sockets.forEach(function (socket) { socket.end(); });
		server.close(function () { done(); });
	});

	it('should get all items', function (done) {
		addToCollection('items', [
			{ title: 'title 1', body: 'body 1', tags: [] }
		], function () {
			request('http://localhost:8090/api/items', function (statusCode, ret) {
				expect(statusCode).toBe(200);
				expect(ret).toEqual(jasmine.any(Array));
				expect(ret.length).toEqual(1);
				expect(ret[0].title).toEqual('title 1');
				expect(ret[0].body).toEqual('body 1');
				expect(ret[0].tags).toEqual([]);

				done();
			});
		});
	});

	function getCollection(name, callback) {
		expect(mongoose.connection.db).toBeTruthy();

		mongoose.connection.db.collection(name, function (err, coll) {
			expect(err).toBeFalsy();

			coll.find().toArray(function (err, ary) {
				expect(err).toBeFalsy();

				callback(ary);
			});
		});
	}

	function addToCollection(name, docs, callback) {
		expect(mongoose.connection.db).toBeTruthy();

		mongoose.connection.db.collection(name, function (err, coll) {
			expect(err).toBeFalsy();

			coll.insert(docs, {safe: true}, function(err, docs) {
				callback(docs);
			});
		});
	}

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
