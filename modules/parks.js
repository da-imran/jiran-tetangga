const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

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
	app.get(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const { parkId } = req.params;
		const apiName = 'Get Park API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'parkId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
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
			openingHours,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'name',
				'description',
				'openingHours',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
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
					return res.status(200).json({
						message: 'Park created successfully',
						_id: inputResult.insertedId,
					});
				} else {
					console.error('❌ failed to create.');
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
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const { parkId } = req.params;
		const {
			name,
			status = status.toUpperCase(),
			location,
			openingHours,
		} = req.body;

		const apiName = 'Update Parks API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'parkId',
			];
			
			if (!requiredCheck(req.params, requiredFields, res)) {
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
					res.status(404).send({
						status: 404,
						message: 'Park not updated'
					});
				} else {
					console.log(`${apiName} MongoDB Success.`);
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
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/parks/:parkId`, async (req, res) => {
		const { parkId } = req.params;

		const apiName = 'Delete Parks API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'parkId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'parks', { _id: mongo.getObjectId(parkId) });
				if (deleteResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						message: 'Park deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					console.error(`❌ ${apiName} failed to delete.`);
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