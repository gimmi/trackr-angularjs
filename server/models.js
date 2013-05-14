var mongoose = require('mongoose');

var options = { 
	toJSON: { 
		transform: function (doc, ret, options) {
			ret.id = ret._id;
			delete ret._id;
		}
	}
};

var itemSchema = mongoose.Schema({
	title: String,
	body: String,
	tags: [String]
}, options);

exports.Item = mongoose.model('Item', itemSchema);

var commentSchema = mongoose.Schema({
	item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
	timestamp: Date,
	body: String
}, options);

exports.Comment = mongoose.model('Comment', commentSchema);
