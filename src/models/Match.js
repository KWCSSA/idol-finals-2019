const { generateNewMatch, addVote, changeVote, getVotes, startMatch, endMatch } = require('../utils/MatchHelper');

class Match {
	constructor() {
		this.state = 0;
		this.id = null;
		this.format = null;
		this.title = null;
		this.candidates = {
			A: null,
			B: null,
			C: null,
			D: null
		};
		console.log('Match instance created');
	}

	async generateNewMatch(format, candidates, title) {
		await this.endVoting();
		var matchID = await generateNewMatch(format.replace('-', '选'), title, candidates);
		this.id = matchID;
		this.format = format;
		this.candidates = candidates;
		this.state = 0;
		this.title = title;
	}

	getMatchID() {
		return this.id;
	}

	getMatchFormat() {
		return this.format;
	}

	getMatchCandidates() {
		return this.candidates;
	}

	getMatchTitle() {
		return this.title;
	}

	isVoting() {
		return this.state === 1;
	}

	async addVote(source, candidate, count) {
		if (this.id) {
			await addVote(this.id, source, candidate, count);
		}
	}

	async changeVote(candidate, count) {
		if (this.id) {
			await changeVote(this.id, candidate, count);
		}
	}

	async getVotes() {
		if (this.id) {
			return await getVotes(this.id);
		} else {
			return { error: true };
		}
	}

	async startVoting() {
		if (this.id && this.state !== 1) {
			await startMatch(this.id);
			this.state = 1;
		}
	}

	async endVoting() {
		if (this.id && this.state !== 0) {
			await endMatch(this.id);
			this.state = 0;
		}
	}
}

module.exports = Match;
