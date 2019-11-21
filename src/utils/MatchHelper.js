const mongoose = require('mongoose');

const MatchModel = mongoose.model('match');
const { sysLogger } = require('./Logger');

module.exports.generateNewMatch = async matchFormat => {
	var matchID = Date.now() * 3;
	var match = new MatchModel({
		matchID,
		matchFormat,
		votesA: 0,
		votesB: 0,
		votesC: 0,
		votesD: 0,
		startTime: 0,
		endTime: 0
	});
	await match.save();
	sysLogger.log('info', `New match generated: ${matchID} - ${matchFormat}`);
	return matchID;
};

module.exports.addVote = async (matchID, source, candidate, count) => {
	var match = await MatchModel.findOne({ matchID });
	switch (candidate) {
		case 1: {
			match.votesA += count;
			break;
		}
		case 2: {
			match.votesB += count;
			break;
		}
		case 3: {
			match.votesC += count;
			break;
		}
		case 4: {
			match.votesD += count;
			break;
		}
		default:
			break;
	}
	await match.save();
	sysLogger.log('info', `[Source: ${source}] Added ${count} votes to candidate ${candidate} in match ${matchID}`);
};

module.exports.changeVote = async (matchID, candidate, count) => {
	var match = await MatchModel.findOne({ matchID });
	switch (candidate) {
		case 1: {
			match.votesA = count;
			break;
		}
		case 2: {
			match.votesB = count;
			break;
		}
		case 3: {
			match.votesC = count;
			break;
		}
		case 4: {
			match.votesD = count;
			break;
		}
		default:
			break;
	}
	await match.save();
	sysLogger.log('info', `[Source: Admin] Changed candidate ${candidate}'s votes to ${count} in match ${matchID}`);
};

module.exports.getVotes = async matchID => {
	var match = await MatchModel.findOne({ matchID });
	var { votesA, votesB, votesC, votesD } = match;
	return { votesA, votesB, votesC, votesD };
};

module.exports.startMatch = async matchID => {
	var match = await MatchModel.findOne({ matchID });
	match.startTime = Date.now();
	await match.save();
	sysLogger.log('info', `Voting started for match ${matchID}`);
};

module.exports.endMatch = async matchID => {
	var match = await MatchModel.findOne({ matchID });
	match.endTime = Date.now();
	await match.save();
	sysLogger.log('info', `Voting started for match ${matchID}`);
};
