const mongoose = require('mongoose');

const VoteModel = mongoose.model('vote');
const { checkVoteExist, addAudienceVote, checkAudienceExist } = require('./AudienceHelper');
const { sysLogger } = require('./Logger');

module.exports.newVote = async (candidate, audienceID, matchID) => {
	if (!await checkAudienceExist(audienceID)) {
		sysLogger.log('error', `Audience ${audienceID} does not exist`);
		return { error: '注册已失效' };
	}
	if (await checkVoteExist(audienceID, matchID)) {
		sysLogger.log('error', `Audience ${audienceID} already voted for ${candidate} in match ${matchID}, vote dropped`);
		return { error: '此轮已投票' };
	}
	var newVote = new VoteModel({
		from: parseInt(audienceID),
		to: candidate,
		matchID: parseInt(matchID),
		timestamp: Date.now()
	});
	await newVote.save();
	await addAudienceVote(parseInt(audienceID), parseInt(matchID));
	return { error: null };
};
