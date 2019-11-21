const mongoose = require('mongoose');

const AudienceModel = mongoose.model('audience');
const { sysLogger } = require('./Logger');

module.exports.generateNewAudiences = async amount => {
	var startID = Date.now() * 2;
	for (let i = 0; i < amount; ++i) {
		var audienceID = `${startID + i * 12345}`;
		var audience = new AudienceModel({ audienceID, votes: [] });
		await audience.save();
		sysLogger.log('info', `New audience generated: ${audienceID}`);
	}
};

module.exports.addAudienceVote = async (audienceID, matchID) => {
	var audience = await AudienceModel.findOne({ audienceID });
	audience.votes.push(matchID);
	await audience.save();
};

module.exports.removeAllAudiences = () => {
	AudienceModel.deleteMany({}, () => {
		return;
	});
};

module.exports.checkAudienceExist = async audienceID => {
	var count = await AudienceModel.countDocuments({ audienceID });
	return count === 1;
};

module.exports.checkVoteExist = async (audienceID, matchID) => {
	var audience = await AudienceModel.findOne({ audienceID });
	return audience.votes.includes(matchID);
};
