// const winston = require('winston');
const { secrets } = require('./secrets');

const LOG_LEVELS = {
	CRITICAL: 'critical',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	DEBUG: 'debug',
};

const getNanoTimestamp = () => `${Date.now()}000000`;

const pushLogs = async (logData) => {
	const {
		level = LOG_LEVELS.INFO,
		message,
		status,
		traceId,
		module = 'general',
		service = 'unknown',
		apiName,
		data,
	} = logData;

	const payload = {
		streams: [
			{
				stream: {
					level,
					module,
					service,
				},
				values: [
					[
						getNanoTimestamp(),
						JSON.stringify({
							timestamp: new Date().toISOString(),
							level,
							message,
							status,
							traceId,
							module,
							service,
							apiName,
							data,
						}),
					],
				],
			},
		],
	};

	try {
		const LOKI_HOST = secrets.LOKI_HOST.value;
		const LOKI_TOKEN = secrets.LOKI_TOKEN.value;

		const response = await fetch(`${LOKI_HOST}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer 1295685:${LOKI_TOKEN}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error(`[Loki] Push failed: ${response.statusText}`);
		}
	} catch (error) {
		console.error('[Loki] Push error:', error.message);
	}
};

const logger = {
	log: async (logData) => {
		await pushLogs(logData);
		console.log(`[${logData.level}]`, logData.message);
	},
};

// // Create log format
// const logFormat = winston.format.printf(({ level, message, timestamp, status, traceId, module, service, data, apiName }) => {
// 	return JSON.stringify({
// 		timestamp,
// 		level,
// 		message,
// 		status,
// 		traceId,
// 		module,
// 		service,
// 		data,
// 		apiName,
// 	});
// });

// // Configure logger
// const logger = winston.createLogger({
// 	level: LOG_LEVELS.INFO,
// 	format: winston.format.combine(
// 		winston.format.timestamp(),
// 		logFormat
// 	),
// 	transports: [
// 		new winston.transports.Console(),
// 		new winston.transports.File({ filename: 'logs/critical.log', level: LOG_LEVELS.CRITICAL }),
// 		new winston.transports.File({ filename: 'logs/error.log', level: LOG_LEVELS.ERROR }),
// 		new winston.transports.File({ filename: 'logs/combined.log' }), // All logs
// 	],
// });

module.exports = {
	logger,
	LOG_LEVELS,
};