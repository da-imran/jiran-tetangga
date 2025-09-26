const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');
const { logger, LOG_LEVELS } = require('../utilities/logger');
const { MODULES, METHODS } = require('../utilities/constants');
const { v4: uuidv4 } = require('uuid');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;
	const SERVICE_NAME = process.env.SERVICE_NAME;
	const MODULE = MODULES.PARKS;

	// Get All Parks API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get All Parks API';

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.GET,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			// Pagination
			const {
				pageNumber = 1,
				dataPerPage = 20,
				search,
				filters,
			} = req.query;

			if (!Number.isInteger(+pageNumber) || +pageNumber <= 0) {
				console.log(`❌ ${apiName} Bad Request: Invalid page number`);
				res.status(400).send({
					status: 400,
					message: 'Bad Request: Invalid page number',
				});

				logger.log({
					service: SERVICE_NAME,
					module: MODULE,
					apiName,
					status: 400,
					message: 'Bad Request: Invalid page number',
					traceId,
					level: LOG_LEVELS.ERROR,
				});
			} else if (!Number.isInteger(+dataPerPage) || +dataPerPage || 0 && +dataPerPage > 100) {
				console.log(`❌ ${apiName} Bad Request: Invalid number of data per page`);
				res.status(400).send({
					status: 400,
					message: 'Bad Request: Invalid number of data per page',
				});

				logger.log({
					service: SERVICE_NAME,
					module: MODULE,
					apiName,
					status: 400,
					message: 'Bad Request: Invalid number of data per page',
					traceId,
					level: LOG_LEVELS.ERROR,
				});
			} else {
				const matchStage = {};
				if (search && search.trim() !== '') {
					const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					matchStage.name = { $regex: safeSearch, $options: 'i' };
				}

				if (typeof filters === 'string' && filters.trim() !== '') {
					const filterArray = filters.split(',').map(f => f.trim());
  					matchStage.status = { $in: filterArray };
				}
				const aggregation = [
					{ $match: matchStage }, // Match
					{ $sort: { createdAt : -1 } }, // Sort
					{ $skip: (+pageNumber - 1) * (+dataPerPage) }, // Pagination
					{ $limit: +dataPerPage },
					// Projection
					{
						$project: {
							name: 1,
							description: 1,
							status: 1,
							openingHours: 1,
							createdAt: 1,
						},
					}
				];

				const countPipeline = [{ $match: matchStage }, { $count: 'total' }];
				const [countResult, parksResult] = await Promise.all([
					mongo.aggregate(mongoClient, 'parks', countPipeline),
					mongo.aggregate(mongoClient, 'parks', aggregation)
				]);

				if (parksResult) {
					const totalCount = (countResult && countResult[0] && countResult[0].total) ? countResult[0].total : 0;

					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: parksResult,
						total: totalCount
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Response Success.',
						data: parksResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Parks not found',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Parks not found',
						data: parksResult,
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Get Park by parkId API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get Park API';
		const { parkId } = req.params;

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.GET,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			const requiredFields = [
				'parkId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const parksResult = await mongo.findOne(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) });
				if (parksResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: parksResult
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Response Success.',
						data: parksResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Parks not found',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Parks not found',
						data: parksResult,
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Create Parks API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Create Parks API';
		const {
			name,
			description,
			openingHours,
		} = req.body;

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.POST,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			const requiredFields = [
				'name',
				'description',
				'openingHours',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.body, requiredFields, res, config)) {
				return;
			} else {
				// 🔎 Proceed to create park
				const inputPark = {
					name,
					description,
					status: 'closed', // Set the status to closed by default
					openingHours: {
						opening: openingHours.opening,
						closing: openingHours.closing
					},
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'parks', inputPark);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).json({
						message: 'Park created successfully',
						_id: inputResult.insertedId,
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Park created successfully',
						data: inputResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.error(`❌ ${apiName} failed to create.`);
					res.status(500).send({
						status: 500,
						message: 'Error creating park.',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 500,
						message: 'Error creating park.',
						data: inputResult,
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Update Parks API by parkId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Update Parks API';
		const { parkId } = req.params;
		const {
			name,
			status = status.toUpperCase(),
			location,
			openingHours,
		} = req.body;

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.PATCH,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			const requiredFields = [
				'parkId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const updateObj = {};

				if (name) updateObj.name = name;
				if (status) updateObj.status = status;
				if (location) updateObj.location = location;
				if (openingHours) {
					if (!updateObj.openingHours) {
						updateObj.openingHours = {};
					}
					if(openingHours.opening) {
						updateObj.openingHours.opening = openingHours.opening;
					}
					if(openingHours.closing) {
						updateObj.openingHours.closing = openingHours.closing;
					}
				}

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) }, updateObj);
				if (!updateResult) {
					console.log(`${apiName} failed to update.`);
					res.status(500).send({
						status: 500,
						message: 'Park not updated'
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 500,
						message: 'Park not updated',
						data: updateResult,
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				} else {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).send({
						status: 200,
						message: 'Park updated successfully.',
						data: JSON.parse(JSON.stringify(updateResult)),
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Park updated successfully.',
						data: updateResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Delete Parks API by parkId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Delete Parks API';
		const { parkId } = req.params;

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.DELETE,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			const requiredFields = [
				'parkId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) });
				if (deleteResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						message: 'Park deleted successfully.',
						data: {
							park: deleteResult
						},
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Park deleted successfully.',
						data: deleteResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.error(`❌ ${apiName} failed to delete.`);
					res.status(500).send({
						status: 500,
						message: 'Park not deleted'
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 500,
						message: 'Park not deleted',
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});
};
