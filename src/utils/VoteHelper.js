const mongoose = require('mongoose');

const VoteModel = mongoose.model('vote');
const { checkVoteExist, addAudienceVote, checkAudienceExist } = require('./AudienceHelper');
const { sysLogger } = require('./Logger');

module.exports.newVote = async (candidate, audienceID, matchID, matchTitle, matchFormat) => {
	candidate = parseInt(candidate);
	if (!await checkAudienceExist(audienceID)) {
		sysLogger.log('error', `Audience ${audienceID} does not exist`);
		return { error: '注册已失效' };
	}
	if (await checkVoteExist(audienceID, matchID)) {
		sysLogger.log('error', `Audience ${audienceID} already voted for ${candidate} in match ${matchID}, vote dropped`);
		return { error: '此轮已投票' };
	}
	var avaliableCandidates = [ false, false, false, false ];
	if (matchFormat === '4-1') {
		avaliableCandidates = [ true, true, true, true ];
	} else if (matchFormat === '3-1') {
		avaliableCandidates = [ true, true, true, false ];
	} else if (matchFormat === '2-1') {
		avaliableCandidates = [ true, true, false, false ];
	}
	if (!avaliableCandidates[candidate - 1]) {
		return { error: '此选择无效' };
	}
	var newVote = new VoteModel({
		from: audienceID,
		to: candidate,
		matchID: matchID,
		matchTitle: matchTitle,
		timestamp: Date.now()
	});
	await newVote.save();
	await addAudienceVote(parseInt(audienceID), parseInt(matchID));
	return { error: null };
};
