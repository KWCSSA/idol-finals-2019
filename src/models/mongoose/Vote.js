const mongoose = require('mongoose');
const { Schema } = mongoose;
const voteSchema = new Schema({
	from: Number,
	to: Number,
	matchID: Number,
	timestamp: Number
});

mongoose.model('vote', voteSchema);
