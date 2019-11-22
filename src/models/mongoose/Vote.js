const mongoose = require('mongoose');
const { Schema } = mongoose;
const voteSchema = new Schema({
	from: String,
	to: Number,
	matchID: String,
	matchTitle: String,
	timestamp: Number
});

mongoose.model('vote', voteSchema);
