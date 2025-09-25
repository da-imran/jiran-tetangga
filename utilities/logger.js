// const winston = require('winston');
const { secrets } = require('./secrets');
const axios = require('axios');

const LOG_LEVELS = {
	CRITICAL: 'critical',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
	DEBUG: 'debug',
};

const getNanoTimestamp = () => `${Date.now()}000000`;

function formatLogLine(data) {
	return Object.entries(data)
		// eslint-disable-next-line no-unused-vars
		.filter(([_, val]) => val !== undefined && val !== null)
		.map(([key, val]) => `${key}=${JSON.stringify(val)}`)
		.join(' ');
}

const logger = {
	async log({
		level = 'info',
		message = '',
		method,
		status,
		traceId,
		module = 'general',
		service = 'app',
		apiName,
		data,
	}) {
		const logLine = formatLogLine({
			timestamp: new Date().toISOString(),
			level,
			message,
			method,
			status,
			traceId,
			module,
			service,
			apiName,
			...(data ? { data } : {}),
		});

		const payload = {
			streams: [
				{
					stream: { level, module, service },
					values: [[getNanoTimestamp(), logLine]],
				},
			],
		};
		try {
			const LOKI_HOST = secrets.LOKI_HOST.value;
			const LOKI_TOKEN = secrets.LOKI_TOKEN.value;
			await axios.post(`${LOKI_HOST}`, payload, {
				headers: { 
					'Content-Type': 'application/json',
					Authorization: `Bearer 1295685:${LOKI_TOKEN}`,
				},
			});
		} catch (err) {
			console.error('❌ Failed to send log to Loki:', err.message);
		}
	},
};

// const pushLogs = async (logData) => {
// 	const {
// 		level = LOG_LEVELS.INFO,
// 		message,
// 		status,
// 		traceId,
// 		module = 'general',
// 		service = 'unknown',
// 		apiName,
// 		data,
// 	} = logData;

// 	const payload = {
// 		streams: [
// 			{
// 				stream: {
// 					level,
// 					module,
// 					service,
// 				},
// 				values: [
// 					[
// 						getNanoTimestamp(),
// 						JSON.stringify({
// 							timestamp: new Date().toISOString(),
// 							level,
// 							message,
// 							status,
// 							traceId,
// 							module,
// 							service,
// 							apiName,
// 							data,
// 						}),
// 					],
// 				],
// 			},
// 		],
// 	};

// 	try {
// 		const LOKI_HOST = secrets.LOKI_HOST.value;
// 		const LOKI_TOKEN = secrets.LOKI_TOKEN.value;

// 		const response = await fetch(`${LOKI_HOST}`, {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				Authorization: `Bearer 1295685:${LOKI_TOKEN}`,
// 			},
// 			body: JSON.stringify(payload),
// 		});

// 		if (!response.ok) {
// 			console.error(`[Loki] Push failed: ${response.statusText}`);
// 		}
// 	} catch (error) {
// 		console.error('[Loki] Push error:', error.message);
// 	}
// };

// const logger = {
// 	log: async (logData) => {
// 		await pushLogs(logData);
// 		console.log(`[${logData.level}]`, logData.message);
// 	},
// };

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