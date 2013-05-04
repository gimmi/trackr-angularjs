"use strict";

var express = require('express');
var app = express();

app.get('/api/items', function (req, res) {
	res.send([{ 
		id: '1', 
		title: 'Title 1', 
		body: 'Body 1', 
		tags: [ "status-open", "area-core", "assignedto-gimmi" ],
		comments: []
	});
});

app.listen(8080);
console.log('Listening on port 8080');
