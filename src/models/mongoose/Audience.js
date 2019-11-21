const mongoose = require('mongoose');
const { Schema } = mongoose;
const audienceSchema = new Schema({
	audienceID: Number,
	votes: Array
});
audienceSchema.index({ audienceID: -1 });

mongoose.model('audience', audienceSchema);
