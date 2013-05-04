"use strict";

var express = require('express');
var app = express();

app.use('/api', app.router);
app.use('/', express.static(__dirname + '/..'));

var items = JSON.parse(require('fs').readFileSync(__dirname + '/../items.json', { encoding: 'utf8' }));

app.get('/items', function (req, res) {
	res.json(items);
});

app.get('/items/:id', function (req, res) {
	var id = req.param('id'),
		item = items.filter(function (item) { return item.id === id; })[0];

	if (item) {
		res.json(item);
	} else {
		ret.status(404);
	}
});

app.post('/items', function () {
	// TODO
});

app.listen(8080);
console.log('Listening on port 8080');
