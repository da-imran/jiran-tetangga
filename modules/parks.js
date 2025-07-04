const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

const parkStatus = {
	OPEN: 'open',
	CLOSED: 'closed',
	MAINTENANCE: 'maintenance'
};

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Parks API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const apiName = 'Get All Parks API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const parksResult = await mongo.find(mongoClient, 'parks');

			if (parksResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: parksResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Parks not found',
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

	// Get Park by parkId API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const apiName = 'Get Park API';
		const { parkId } = req.query;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'parkId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const parksResult = await mongo.find(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) });
				if (parksResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: parksResult
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Parks not found',
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

	// Create Parks API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const apiName = 'Create Parks API';
		const {
			name,
			description,
			images,
			location,
			openingHours,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'name',
				'description',
				'images',
				'openingHours',
				'location',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create park
				const inputPark = {
					name,
					description,
					status: parkStatus.CLOSED, // Set the status to CLOSED by default
					images,
					location,
					openingHours,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'reports', inputPark);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Park created successfully',
						adminId: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating park.');
					res.status(404).send({
						status: 404,
						message: 'Error creating park.',
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

	// Update Parks API by parkId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const { parkId } = req.query;
		const {
			name,
			condition,
			lastInspected,
			images,
			notes,
			location,
			updatedBy,
		} = req.body;

		const apiName = 'Update Parks API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'parkId',
			];
			
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const updateObj = {};

				if (name) updateObj.name = name;
				if (condition) updateObj.condition = condition;
				if (lastInspected) updateObj.lastInspected = lastInspected;
				if (images) updateObj.images = images;
				if (notes) updateObj.notes = notes;
				if (location) updateObj.location = location;
				if (updatedBy) updateObj.updatedBy = updatedBy;
				updateObj.updatedAt = new Date();

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Park not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Park updated successfully.',
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

	// Delete Parks API by parkId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/parks`, async (req, res) => {
		const { parkId } = req.query;

		const apiName = 'Delete Parks API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'parkId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Park deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Park not deleted'
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