const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const { sysLogger } = require('./utils/Logger');

var app = express();

if (process.env.NODE_ENV === 'production') {
	mongoose.connect(
		`mongodb://${process.env.ADMIN_USERNAME}:${process.env
			.ADMIN_DBPASS}@172.105.28.135:27017/idol-finals-2019?authSource=admin`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	);
} else {
	mongoose.connect('mongodb://localhost/idol-finals-2019', { useNewUrlParser: true, useUnifiedTopology: true });
}
var db = mongoose.connection;
db.on('error', error => {
	sysLogger.log('error', 'Database connection error');
});
db.once('open', () => {
	runApp();
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

function runApp() {
	const PORT = process.env.PORT || 9898;
	app.listen(PORT, () => {
		sysLogger.log('info', '================================================================================');
		sysLogger.log('info', `DB Connected, listening on PORT ${PORT}`);
	});
}
