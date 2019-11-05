const winston = require('winston');
var fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');

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

const sysLogger = winston.createLogger({
	format: logFormat,
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ level: 'error', filename: path.join(__dirname, '..', 'logs', 'sysError.log') }),
		new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'sysInfo.log') })
	]
});

module.exports = {
	sysLogger
};
