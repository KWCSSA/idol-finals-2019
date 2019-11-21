const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrat = require('passport-local').Strategy;
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo')(session);

const { sysLogger } = require('./utils/Logger');

var app = express();

require('./models/mongoose');

// db connection
if (process.env.NODE_ENV === 'production') {
	mongoose.connect(
		`mongodb://${process.env.ADMIN_USERNAME}:${process.env
			.ADMIN_DBPASS}@172.105.28.135:27017/idol-finals-2019?authSource=admin`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		}
	);
} else {
	mongoose.connect('mongodb://localhost/idol-finals-2019', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	});
}
var db = mongoose.connection;
db.on('error', error => {
	sysLogger.log('error', 'Database connection error');
});
db.once('open', () => {
	runApp();
});

passport.use(
	new LocalStrat(async (username, password, callback) => {
		if (username === process.env.ADMIN_USERNAME) {
			if (password !== process.env.ADMIN_PASSWORD) {
				return callback(null, false);
			} else {
				const user = {
					id: username,
					isAdmin: true
				};
				return callback(null, user);
			}
		} else if (username === 'audience') {
			const AudienceModel = mongoose.model('audience');
			AudienceModel.findOne({ audienceID: password })
				.then(data => {
					if (!data) {
						return callback(null, false);
					}
					const user = {
						id: data.audienceID,
						isAudience: true
					};
					return callback(null, user);
				})
				.catch(err => {
					return callback(null, false);
				});
		} else {
			callback(null, false);
		}
	})
);

passport.serializeUser((user, callback) => {
	callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
	if (id === process.env.ADMIN_USERNAME) {
		const user = {
			id: process.env.ADMIN_USERNAME,
			isAdmin: true
		};
		return callback(null, user);
	} else {
		const AudienceModel = mongoose.model('audience');
		AudienceModel.findOne({ audienceID: id })
			.then(data => {
				if (!data) {
					return callback(null, false);
				}
				const user = {
					id: data.audienceID,
					isAudience: true
				};
				return callback(null, user);
			})
			.catch(err => {
				return callback(null, false);
			});
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('trust proxy', 1);

var cookieConfig = {
	maxAge: 1000 * 60 * 60 * 5,
	httpOnly: false
};
if (process.env.NODE_ENV === 'production') {
	cookieConfig = {
		maxAge: 1000 * 60 * 60 * 5,
		httpOnly: true,
		domain: 'idols.ituwcssa.com',
		sameSite: true,
		secure: true
	};
}

app.use(
	session({
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: cookieConfig
	})
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== 'production') {
	console.log('In production, using cors');
	const cors = require('cors');
	app.use(
		cors({
			credentials: true,
			origin: 'http://localhost:3000'
		})
	);
}

// match instance
const Match = require('./models/Match');

var match = new Match();

// handle admin routes
require('./routes/adminRoutes')(app, match);

// handle audience routes
require('./routes/audienceRoutes')(app, match);

app.get('/api/results', async (req, res) => {
	res.send(await match.getVotes());
});

app.get('/api/isVoting', (req, res) => {
	res.send({ isVoting: match.isVoting() });
});

app.get('/api/format', (req, res) => {
	res.send({ format: match.getMatchFormat() });
});

// serve react
app.use(express.static('client/build'));
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

function runApp() {
	const PORT = process.env.PORT || 9898;
	app.listen(PORT, () => {
		sysLogger.log('info', '================================================================================');
		sysLogger.log('info', `DB Connected, listening on PORT ${PORT}`);
	});
}
