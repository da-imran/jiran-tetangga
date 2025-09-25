const { ObjectId } = require('mongodb');
const { logger, LOG_LEVELS } = require('./logger');
const SERVICE_NAME = process.env.SERVICE_NAME;

const requiredCheck = (input, requiredFields, res, config) => {
	const { traceId, apiName, MODULE } = config;
	for (const field of requiredFields) {
		const hasField = Object.prototype.hasOwnProperty.call(input, field);
		const value = input[field];
		const isEmptyString = typeof value === 'string' && value.trim() === '';

		if (!hasField || value === null || value === undefined || isEmptyString) {
			console.error(`❌ Bad request: ${field} is a required parameter.`);
			res.status(400).send({
				status: 400,
				message: `Bad request: ${field} is a required parameter.`,
			});
			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 400,
				traceId,
				message: `Bad request: ${field} is a required parameter.`,
				level: LOG_LEVELS.ERROR,
			});
			return false;
		}

		if (field.toLowerCase().endsWith('id')) {
			if (!ObjectId.isValid(input[field])) {
				console.error(`❌ Bad request: ${field} must be a valid ObjectId.`);
				res.status(400).send({
					status: 400,
					message: `Bad request: ${field} must be a valid ObjectId.`,
				});
				logger.log({
					service: SERVICE_NAME,
					module: MODULE,
					apiName,
					status: 400,
					traceId,
					message: `Bad request: ${field} must be a valid ObjectId.`,
					level: LOG_LEVELS.ERROR,
				});
				return false;
			}
		}
	}
	return true;
};

const invalidFieldCheck = (input, invalidFields, res, config) => {
	const { traceId, apiName, MODULE } = config;
	for (const field of invalidFields) {
		if (input[field]) {
			console.error(`❌ Bad request: ${field} cannot be updated.`);
			res.status(400).send({
				status: 400,
				message: `Bad request: ${field} cannot be updated.`,
			});
			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 400,
				traceId,
				message: `Bad request: ${field} cannot be updated.`,
				level: LOG_LEVELS.ERROR,
			});
			return false;
		} 
	}
	return true;
};

module.exports = { requiredCheck, invalidFieldCheck }; 