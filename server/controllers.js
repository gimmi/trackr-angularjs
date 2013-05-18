"use strict";

var mongoose = require('mongoose'),
	models = require('./models');

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
	new models.Item(req.body).save(function (err, item) {
		if (err) {
			res.send(500, err);
		} else {
			res.location('/api/items/' + item.id);
			res.send(201);
		}
	});
};

exports.putItem = function (req, res) {
	var id = req.param('id'),
		newItem = req.body;

	models.Item.findById(id, function (err, item) {
		if (err) {
			res.send(500, err);
		} else if (item) {
			item.title = newItem.title;
			item.tags = newItem.tags;
			item.body = newItem.body;
			item.save(function (err, item) {
				if (err) {
					res.send(500, err);
				} else {
					res.send(200);
				}
			});
		} else {
			res.send(404);
		}
	});
};

exports.getComments = function (req, res) {
	var id = req.param('id');

	models.Item.findById(id, function (err, item) {
		if (err) {
			res.send(500, err);
		} else if (item) {
			models.Comment.find({ item: item._id }, function (err, comments) {
				if (err) {
					res.json(500, err);
				} else {
					res.json(comments);
				}
			});
		} else {
			res.send(404);
		}
	});
};

exports.getComment = function (req, res) {
	var itemId = req.param('itemId'),
		commentId = req.param('commentId');

	models.Comment.findOne({ _id: commentId, item: itemId }, function (err, comment) {
		if (err) {
			res.send(500, err);
		} else if (comment) {
			res.json(comment);
		} else {
			res.send(404);
		}
	});
};


exports.postComment = function (req, res) {
	var id = req.param('id');

	models.Item.findById(id, function (err, item) {
		if (err) {
			res.send(500, err);
		} else if (item) {
			new models.Comment(req.body).save(function (err, comment) {
				if (err) {
					res.send(500, err);
				} else {
					res.location('/api/items/' + item.id + '/comments/' + comment.id);
					res.send(201);
				}
			});
		} else {
			res.send(404);
		}
	});
};
