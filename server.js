"use strict";

var express = require('express'),
	mongoose = require('mongoose'),
	ctrls = require('./controllers');
var app = module.exports = express();

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.get('/api/items', ctrls.getItems);
app.get('/api/items/:id', ctrls.getItem);
app.post('/api/items', ctrls.postItem);
app.put('/api/items/:id', ctrls.putItem);
app.get('/api/items/:id/comments', ctrls.getComments);
app.post('/api/items/:id/comments', ctrls.postComment);
app.get('/api/items/:itemId/comments/:commentId', ctrls.getComment);
app.get('/api/tags', ctrls.getTags);

if (!module.parent) {
	mongoose.connect('mongodb://localhost/trackr');
	app.listen(8080);
	console.log('Listening on port 8080');
}
