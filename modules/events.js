const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get all Events or by filter API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events`, async (req, res) => {
		const apiName = 'Get All Events API';
		const {
			title,
			description,
			date,
			location,
			hostId,
			isPublic,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const filter = {};
			if (title) filter.title = title;
			if (description) filter.description = description;
			if (date) filter.date = date;
			if (location) filter.location = location;
			if (hostId) filter.hostId = hostId;
			if (isPublic) filter.isPublic = isPublic;

			const eventsResult = await mongo.aggregate(mongoClient, 'events', [
				{ $match: filter } // Filter by the provided params
			]);

			if (eventsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: eventsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Events not found',
				});
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});
		}
	});

	// Get all Events by eventId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const apiName = 'Get Event API';
		const { eventId } = req.params;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const eventsResult = await mongo.aggregate(mongoClient, 'events', {_id: mongo.getObjectId(eventId)});

			if (eventsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: eventsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Events not found',
				});
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});
		}
	});

	// Create Events API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/events`, async (req, res) => {
		const apiName = 'Create Events API';
		const {
			title,
			description,
			eventDate,
			location,
			hostId,
			isPublic,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'title',
				'description',
				'eventDate',
				'location',
				'hostId',
				'isPublic',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create event
				const inputEvents = {
					title,
					description,
					eventDate,
					location,
					hostId,
					isPublic,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'events', inputEvents);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Event created successfully',
						adminId: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating event.');
					res.status(404).send({
						status: 404,
						message: 'Error creating event.',
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
		}
	});

	// Update Events API by eventId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const { eventId } = req.params;
		const { 
			title,
			description,
			eventDate,
			location,
			hostId,
			isPublic,
		} = req.body;

		const apiName = 'Update Events API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!eventId) {
				console.log(`❌ ${apiName} Bad request: eventId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: eventId is a required parameter.',
				});
			} else {
				const updateObj = {};

				if (title) updateObj.title = title;
				if (description) updateObj.description = description;
				if (eventDate) updateObj.eventDate = eventDate;
				if (location) updateObj.location = location;
				if (hostId) updateObj.hostId = hostId;
				if (isPublic) updateObj.isPublic = isPublic;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'events', { _id: mongo.getObjectId(eventId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Event not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Event updated successfully.',
						data: JSON.parse(JSON.stringify(updateResult)),
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
		}
	});

	// Delete Event by eventId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const { eventId } = req.params;

		const apiName = 'Delete Event API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!eventId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: eventId is a required parameters.',
				});
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'events', { _id: mongo.getObjectId(eventId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Event deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Event not deleted'
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
		}
	});
};