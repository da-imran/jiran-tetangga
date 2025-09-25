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
		level = LOG_LEVELS.INFO,
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

module.exports = {
	logger,
	LOG_LEVELS,
};