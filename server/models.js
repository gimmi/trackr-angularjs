var mongoose = require('mongoose'),
	ObjectId = require('mongoose').Schema.Types.ObjectId;

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
	itemId: ObjectId,
	timestamp: Date,
	body: String
}, options);

exports.Comment = mongoose.model('Comment', commentSchema);
