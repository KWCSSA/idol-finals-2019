const { generateNewMatch, addVote, changeVote, getVotes, startMatch, endMatch } = require('../utils/MatchHelper');

class Match {
	constructor() {
		this.matchState = 0;
		this.matchID = null;
		this.matchFormat = '';
		console.log('Match instance created');
	}

	async generateNewMatch(format) {
		await this.endVoting();
		var matchID = await generateNewMatch(format.replace('-', '选'));
		this.matchID = matchID;
		this.matchFormat = format;
		this.matchState = 0;
	}

	getMatchID() {
		return this.matchID;
	}

	getMatchFormat() {
		return this.matchFormat;
	}

	isVoting() {
		return this.matchState === 1;
	}

	async addVote(source, candidate, count) {
		if (this.matchID) {
			await addVote(this.matchID, source, candidate, count);
		}
	}

	async changeVote(candidate, count) {
		if (this.matchID) {
			await changeVote(this.matchID, candidate, count);
		}
	}

	async getVotes() {
		if (this.matchID) {
			return await getVotes(this.matchID);
		} else {
			return { error: true };
		}
	}

	async startVoting() {
		if (this.matchID && this.matchState !== 1) {
			await startMatch(this.matchID);
			this.matchState = 1;
		}
	}

	async endVoting() {
		if (this.matchID && this.matchState !== 0) {
			await endMatch(this.matchID);
			this.matchState = 0;
		}
	}
}

module.exports = Match;
