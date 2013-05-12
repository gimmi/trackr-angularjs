var http = require('http');
var mongoose = require('mongoose');
var Q = require('q');
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
		addToCollection('items', { _id: '518e5b6d96661c4008000002', title: 'title 1', body: 'body 1', tags: ['tag1'] }).then(function () {
			return request('http://localhost:8090/api/items');
		}).then(function (ret) {
			expect(ret.statusCode).toBe(200);
			expect(ret.data).toEqual(jasmine.any(Array));
			expect(ret.data.length).toEqual(1);
			expect(ret.data[0]).toEqual({ _id: '518e5b6d96661c4008000002', title: 'title 1', body: 'body 1', tags: ['tag1'] });

			done();
		}).fail(done);
	});

	it('should get single item', function (done) {
		addToCollection('items', { _id: '518e5b6d96661c4008000002', title: 'title 1', body: 'body 1', tags: ['tag1'] }).then(function () {
			return request('http://localhost:8090/api/items/518e5b6d96661c4008000002');
		}).then(function (ret) {
			expect(ret.statusCode).toBe(200);
			expect(ret.data).toEqual({ _id: '518e5b6d96661c4008000002', title: 'title 1', body: 'body 1', tags: ['tag1'] });

			done();
		}).fail(done);
	});

	function getCollection(name) {
		var deferred = Q.defer();

		mongoose.connection.db.collection(name, function (err, coll) {
			if (err) { deferred.reject(err); return; }

			coll.find().toArray(function (err, ary) {
				if (err) { deferred.reject(err); return; }

				deferred.resolve(ary);
			});
		});

		return deferred.promise;
	}

	function addToCollection(name, docs) {
		var deferred = Q.defer();

		docs = Array.isArray(docs) ? docs : [docs];

		docs.forEach(function (doc) {
			if (doc._id) { 
				doc._id = mongoose.Types.ObjectId(doc._id) 
			}
		});

		mongoose.connection.db.collection(name, function (err, coll) {
			if (err) { 
				deferred.reject(err); 
				return;
			}

			coll.insert(docs, {safe: true}, function(err, docs) {
				if (err) { 
					deferred.reject(err); 
					return;
				}

				deferred.resolve(docs);
			});
		});

		return deferred.promise;
	}

	function request(options) {
		var deferred = Q.defer();

		http.request(options, function (res) {
			var contentType = res.headers['content-type'].split(';')[0],
				data = '';

			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});

			res.on('end', function() {
				if (contentType == 'application/json') {
					try {
						data = JSON.parse(data);
					} catch (e) {
						deferred.reject(err);
						return;
					}
				}
				deferred.resolve({statusCode: res.statusCode, data: data});
			});
		}).end();

		return deferred.promise;
	}
});
