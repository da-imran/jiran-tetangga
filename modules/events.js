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
	const MODULE = MODULES.EVENTS;

	// Get all Events
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get All Events API';

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

			if (Number.isInteger(+pageNumber) || +pageNumber <= 0) {
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
				let matchStage = {};
				if (search && search.trim() !== '') {
					matchStage.title = { $regex: search, $options: 'i' };
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
							title: 1,
							description: 1,
							organizerName: 1,
							organizerEmail: 1,
							eventDate: 1,
							location: 1,
							status: 1,
							createdAt: 1,
						},
					}
				];

				const countPipeline = [{ $match: matchStage }, { $count: 'total' }];
				const [countResult, eventsResult] = await Promise.all([
					mongo.aggregate(mongoClient, 'events', countPipeline),
					mongo.aggregate(mongoClient, 'events', aggregation)
				]);

				if (eventsResult) {
					const totalCount = (countResult && countResult[0] && countResult[0].total) ? countResult[0].total : 0;

					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: eventsResult,
						total: totalCount
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Response Success',
						data: eventsResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Events not found',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Events not found',
						data: eventsResult,
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

	// Get Event by eventId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get Event API';
		const { eventId } = req.params;

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
				'eventId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const eventsResult = await mongo.findOne(mongoClient, 'events', {_id: mongo.getObjectId(eventId)});
				if (eventsResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: eventsResult
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Response Success',
						data: eventsResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Events not found',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Events not found',
						data: eventsResult,
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

	// Create Events API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/events`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Create Events API';
		
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
			const input = req.body?.inputObj ?? req.body;
			const title = input?.eventName ?? input?.title;
			const organizerName = input?.organizerName ?? null; // null if created by admin
			const organizerEmail = input?.organizerEmail ?? null; // null if created by admin
	
			const {
				description,
				eventDate,
				location,
			} = input;

			const requiredFields = [
				'eventName',
				'description',
				'organizerName',
				'organizerEmail',
				'eventDate',
				'location',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(input, requiredFields, res, config)) {
				return;
			} else {
				// 🔎 Proceed to create event
				const inputEvents = {
					title,
					description,
					organizerName,
					organizerEmail,
					eventDate,
					location,
					status: 'pending',
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'events', inputEvents);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).json({
						status: 200,
						message: 'Event created successfully',
						_id: inputResult.insertedId,
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Event created successfully',
						data: inputResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.error(`❌ ${apiName} failed to create.`);
					res.status(404).send({
						status: 404,
						message: 'Error creating event.',
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Error creating event.',
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

	// Update Events API by eventId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Update Events API';
		const { eventId } = req.params;
		const { 
			title,
			description,
			location,
			status,
			eventDate,
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
				'eventId',
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

				if (title) updateObj.title = title;
				if (description) updateObj.description = description;
				if (location) updateObj.location = location;
				if (status) updateObj.status = status;
				if (eventDate) updateObj.eventDate = eventDate;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'events', { _id: mongo.getObjectId(eventId) }, updateObj);
				if (!updateResult) {
					console.log(`${apiName} failed to update.`);
					res.status(404).send({
						status: 404,
						message: 'Event not updated'
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Event not updated',
						data: updateResult,
						traceId,
						level: LOG_LEVELS.ERROR,
					});
				} else {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).send({
						status: 200,
						message: 'Event updated successfully.',
						data: JSON.parse(JSON.stringify(updateResult)),
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Event updated successfully.',
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

	// Delete Event by eventId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Delete Event API';
		const { eventId } = req.params;

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
				'eventId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'events', { _id: mongo.getObjectId(eventId) });
				if (deleteResult) {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).send({
						status: 200,
						message: 'Event deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Event deleted successfully.',
						data: deleteResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.error(`❌ ${apiName} failed to delete.`);
					res.status(404).send({
						status: 404,
						message: 'Event not deleted'
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Event not deleted.',
						data: deleteResult,
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