const winston = require('winston');
var fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
	winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss'
	}),
	winston.format.align(),
	winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

var transports = [ new winston.transports.Console() ];

if (process.env.NODE_ENV === 'production') {
	transports = [
		new winston.transports.Console(),
		new winston.transports.File({ level: 'error', filename: path.join(logDir, 'sysError.log') }),
		new winston.transports.File({ filename: path.join(logDir, 'sysInfo.log') })
	];
}

const sysLogger = winston.createLogger({
	format: logFormat,
	transports
});

module.exports = {
	sysLogger
};
