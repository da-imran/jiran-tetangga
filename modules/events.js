const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get all Events or by filter API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events`, async (req, res) => {
		const apiName = 'Get All Events API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const eventsResult = await mongo.aggregate(mongoClient, 'events');

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

	// Get Event by eventId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, async (req, res) => {
		const apiName = 'Get Event API';
		const { eventId } = req.params;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'eventId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
				return;
			} else {
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
		const input = req.body?.inputObj ?? req.body;
		const title = input?.eventName ?? input?.title;
		const organizerName = input?.organizerName ?? null; // null if created by admin
		const organizerEmail = input?.organizerEmail ?? null; // null if created by admin
	
		const {
			description,
			eventDate,
			location,
		} = input;

		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'title',
				'description',
				'eventDate',
				'location',
			];
			if (!requiredCheck(input, requiredFields, res)) {
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
					return res.status(200).json({
						status: 200,
						message: 'Event created successfully',
						_id: inputResult.insertedId,
					});
				} else {
					console.error(`❌ ${apiName} failed to create.`);
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
			location,
			status,
			eventDate,
		} = req.body;

		const apiName = 'Update Events API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			
			const requiredFields = [
				'eventId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
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
				} else {
					console.log(`${apiName} MongoDB Success.`);
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
			const requiredFields = [
				'eventId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
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
				} else {
					console.error(`❌ ${apiName} failed to delete.`);
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