"use strict";

var express = require('express');
var app = express();

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/..'));

var items = JSON.parse(require('fs').readFileSync(__dirname + '/../items.json', { encoding: 'utf8' }));
var findItem = function (id) {
	return items.filter(function (item) { return item.id === id; })[0];
};

app.get('/api/items', function (req, res) {
	res.json(items);
});

app.get('/api/items/:id', function (req, res) {
	var id = req.param('id'),
		item = findItem(id);

	if (item) {
		res.json(item);
	} else {
		res.send(404);
	}
});

app.post('/api/items', function (req, res) {
	var item = req.body;

	item.id = Math.random().toString(36).substring(2);
	item.comments = [];

	items.push(item);

	res.location('/api/items/' + item.id);
	res.send(201);
});

app.put('/api/items/:id', function (req, res) {
	var id = req.param('id'),
		newItem = req.body,
		item = findItem(id);

	if (item) {
		item.title = newItem.title;
		item.tags = newItem.tags;
		item.body = newItem.body;
		res.send(200);
	} else {
		res.send(404);
	}
});

app.get('/api/items/:id/comments', function (req, res) {
	var id = req.param('id'),
		newComment = req.body,
		item = findItem(id);

	if (item) {
		res.json(item.comments);
	} else {
		res.send(404);
	}
});

app.post('/api/items/:id/comments', function (req, res) {
	var id = req.param('id'),
		item = findItem(id);

	if (item) {
		item.comments.push({
			itemId: id,
			timestamp: new Date(),
			text: newComment.text
		});
	} else {
		res.send(404);
	}
});

app.listen(8080);
console.log('Listening on port 8080');
