const passport = require('passport');

const { sysLogger } = require('../utils/Logger');
const { newVote } = require('../utils/VoteHelper');

module.exports = (app, match) => {
	app.get('/audience/status', (req, res) => {
		res.send(req.user);
	});

	app.post('/audience/login', passport.authenticate('local'), (req, res) => {
		sysLogger.log('info', `Audience login: ${req.user.id}`);
		res.send(req.user);
	});

	app.get('/audience/logout', (req, res) => {
		sysLogger.log('info', `Audience logout: ${req.user.id}`);
		req.logout();
		res.redirect('/');
	});

	app.use('/api/audience', (req, res, next) => {
		if (req.user && req.user.isAudience) {
			next();
		} else {
			res.status(403).end();
		}
	});

	app.post('/api/audience/vote', async (req, res) => {
		var audienceID = req.user.id;
		var { candidate } = req.body;
		var matchID = match.getMatchID();
		var matchFormat = match.getMatchFormat();
		if (match.isVoting()) {
			var result = await newVote(candidate, audienceID, matchID, matchFormat);
			if (!result.error) {
				await match.addVote('Audience', candidate, 1);
				res.send({ error: null });
			} else {
				res.send(result);
			}
		} else {
			sysLogger.log('error', `Audience ${audienceID} voted for candidate ${candidate} while voting is not open`);
			res.send({ error: '投票尚未开始' });
		}
	});
};
