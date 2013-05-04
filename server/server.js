"use strict";

var express = require('express');
var app = express();

app.use('/api', express.bodyParser());
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
		res.send(404);
	}
});

app.post('/items', function (req, res) {
	var newItem = req.body,
		index = null;

	items.forEach(function (v, i) { 
		if (v.id === newItem.id) {
			index = i;
		}
	});

	if (!index) {
		index = items.length;
		items.push({
			id: Math.random().toString(36).substring(2)
		});
	}

	items[index].title = newItem.title;
	items[index].tags = newItem.tags;
	items[index].body = newItem.body;

	res.json(items[index]);
});

app.listen(8080);
console.log('Listening on port 8080');
