"use strict";

var mongoose = require('mongoose'),
	models = require('./models');

var items = JSON.parse(require('fs').readFileSync(__dirname + '/../items.json', { encoding: 'utf8' }));
var findItem = function (id) {
	return items.filter(function (item) { return item.id === id; })[0];
};

exports.getItems = function (req, res) {
	models.Item.find(function (err, items) {
		if (err) {
			res.json(500, err);
		} else {
			res.json(items);
		}
	});
};

exports.getItem = function (req, res) {
	var id = req.param('id');

	models.Item.findById(id, function (err, item) {
		if (err) {
			res.send(500, err);
		} else if (item) {
			res.json(item);
		} else {
			res.send(404);
		}
	});
};

exports.postItem = function (req, res) {
	var item = req.body;

	item.id = Math.random().toString(36).substring(2);
	item.comments = [];

	items.push(item);

	res.location('/api/items/' + item.id);
	res.send(201);
};

exports.putItem = function (req, res) {
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
};

exports.getComments = function (req, res) {
	var id = req.param('id'),
		newComment = req.body,
		item = findItem(id);

	if (item) {
		res.json(item.comments);
	} else {
		res.send(404);
	}
};

exports.postComment = function (req, res) {
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
};
