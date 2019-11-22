const passport = require('passport');
const { generateNewAudiences } = require('../utils/AudienceHelper');

module.exports = (app, match) => {
	app.get('/admin/status', (req, res) => {
		res.send(req.user);
	});

	app.post('/admin/login', passport.authenticate('local'), (req, res) => {
		res.send(req.user);
	});

	app.get('/admin/logout', (req, res) => {
		req.logout();
		res.send('success');
	});

	app.use('/api/admin', (req, res, next) => {
		if (req.user && req.user.isAdmin) {
			next();
		} else {
			res.status(403).end();
		}
	});

	app.post('/api/admin/generateRegCode', (req, res) => {
		generateNewAudiences(100);
		res.send('success');
	});

	app.post('/api/admin/generateNewMatch', async (req, res) => {
		var { format, candidates, title } = req.body;
		await match.generateNewMatch(format, candidates, title);
		res.send({
			id: match.getMatchID(),
			format: match.getMatchFormat(),
			candidates: match.getMatchCandidates(),
			title: match.getMatchTitle()
		});
	});

	app.get('/api/admin/getMatchInfo', (req, res) => {
		res.send({
			id: match.getMatchID(),
			format: match.getMatchFormat(),
			title: match.getMatchTitle(),
			candidates: match.getMatchCandidates(),
			isVoting: match.isVoting()
		});
	});

	app.post('/api/admin/startVoting', (req, res) => {
		match.startVoting();
		res.send({ error: false });
	});

	app.post('/api/admin/endVoting', (req, res) => {
		match.endVoting();
		res.send({ error: false });
	});

	app.post('/api/admin/addVote', async (req, res) => {
		var { candidate, count } = req.body;
		await match.addVote('Admin', candidate, count);
		res.send(await match.getVotes());
	});

	app.post('/api/admin/changeVote', async (req, res) => {
		var { candidate, count } = req.body;
		await match.changeVote(candidate, count);
		res.send(await match.getVotes());
	});
};
