const mongoose = require('mongoose');

const MatchModel = mongoose.model('match');
const { sysLogger } = require('./Logger');

module.exports.generateNewMatch = async (matchFormat, matchTitle, candidates) => {
	var matchID = `${Date.now() * 3}`;
	var match = new MatchModel({
		matchID,
		matchFormat,
		matchTitle,
		matchCandidates: [ `A: ${candidates.A}`, `B: ${candidates.B}`, `C: ${candidates.C}`, `D: ${candidates.D}` ],
		votesA: 0,
		votesB: 0,
		votesC: 0,
		votesD: 0,
		startTime: 0,
		endTime: 0
	});
	await match.save();
	var candidateString = '';
	if (candidates.A) {
		candidateString += ` | A : ${candidates.A}`;
	}
	if (candidates.B) {
		candidateString += ` | B : ${candidates.B}`;
	}
	if (candidates.C) {
		candidateString += ` | C : ${candidates.C}`;
	}
	if (candidates.D) {
		candidateString += ` | D : ${candidates.D}`;
	}
	this.se;
	sysLogger.log('info', `New match generated: ${matchID} | ${matchTitle} | ${matchFormat}${candidateString}`);
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
	sysLogger.log('info', `Voting ended for match ${matchID}`);
};
