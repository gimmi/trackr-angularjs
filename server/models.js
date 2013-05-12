var mongoose = require('mongoose');

var itemSchema = mongoose.Schema({
	title: String,
	body: String,
	tags: [String]
});

exports.Item = mongoose.model('Item', itemSchema);

var commentSchema = mongoose.Schema({
	item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
	timestamp: Date,
	body: String
});

exports.Comment = mongoose.model('Comment', commentSchema);
