const mongoose = require('mongoose');
const { Schema } = mongoose;
const matchSchema = new Schema({
	matchID: String,
	matchFormat: String,
	matchTitle: String,
	matchCandidates: Array,
	votesA: Number,
	votesB: Number,
	votesC: Number,
	votesD: Number,
	startTime: Number,
	endTime: Number
});
matchSchema.index({ matchID: -1 });

mongoose.model('match', matchSchema);
