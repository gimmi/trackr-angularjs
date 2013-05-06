var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
	title: String,
	body: String,
	tags: [String]
});

exports.Item = mongoose.model('Item', itemSchema);
