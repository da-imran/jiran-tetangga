const winston = require('winston');

const LOG_LEVELS = {
	CRITICAL: 'critical',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	DEBUG: 'debug',
};

// Create log format
const logFormat = winston.format.printf(({ level, message, timestamp, status, traceId, module, service, data, apiName }) => {
	return JSON.stringify({
		timestamp,
		level,
		message,
		status,
		traceId,
		module,
		service,
		data,
		apiName,
	});
});

// Configure logger

const logger = winston.createLogger({
	level: LOG_LEVELS.INFO,
	format: winston.format.combine(
		winston.format.timestamp(),
		logFormat
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'logs/critical.log', level: LOG_LEVELS.CRITICAL }),
		new winston.transports.File({ filename: 'logs/error.log', level: LOG_LEVELS.ERROR }),
		new winston.transports.File({ filename: 'logs/combined.log' }), // All logs
	],
});

module.exports = {
	logger,
	LOG_LEVELS,
};