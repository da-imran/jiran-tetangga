const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

const disruptionCategory = {
	INFO: 'informational', // More like general disruption
	WARNING: 'warning', // Alerts on potential disruption
	ALERT: 'alert', // More urgent or critical notification than warning
	EMERGENCY: 'emergency' // Highest level of urgency, indicating serious situation
};

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Disruptions API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/disruptions`, async (req, res) => {
		const apiName = 'Get All Disruptions API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const mongoResult = await mongo.find(mongoClient, 'disruptions');

			if (mongoResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: mongoResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Disruptions not found',
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

	// Get Disruption by disruptionId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/disruptions`, async (req, res) => {
		const apiName = 'Get Disruption API';
		const { disruptionId } = req.query;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'disruptionId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const mongoResult = await mongo.find(mongoClient, 'disruptions', {_id: mongo.getObjectId(disruptionId)});
				if (mongoResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: mongoResult
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Disruption not found',
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

	// Create Disruptions API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/disruptions`, async (req, res) => {
		const apiName = 'Create Disruption API';
		const {
			title,
			description,
			adminId,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'title',
				'description',
				'adminId',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create disruption
				const inputObj = {
					title,
					description,
					status: false, // Set false as default value for inactive
					category: disruptionCategory.INFO, // Set edfault value as INFO
					createdBy: mongo.getObjectId(adminId),
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'disruptions', inputObj);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Disruption created successfully',
						_id: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating disruption.');
					res.status(404).send({
						status: 404,
						message: 'Error creating disruption.',
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

	// Update Disruptions by shopId 
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/disruptions`, async (req, res) => {
		const { disruptionId } = req.query;
		const {
			title,
			description,
			category,
			status,
			adminId,
		} = req.body;

		const apiName = 'Update Disruption API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			
			const requiredFields = [
				'disruptionId',
				'adminId',
			];

			const dataToValidate = { ...req.query, ...req.body };
			if (!requiredCheck(dataToValidate, requiredFields, res)) {
				return;
			} else {
				const updateObj = {};

				if (title) updateObj.title = title;
				if (category) updateObj.category = disruptionCategory[category];
				if (description) updateObj.description = description;
				if (status) updateObj.status = status;
				if (adminId) updateObj.adminId = adminId;
				updateObj.updatedAt = new Date();

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'disruptions', { _id: mongo.getObjectId(disruptionId) }, updateObj);
				if (!updateResult) {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Disruption not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Disruption updated successfully.',
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

	// Delete Disruptions API by shopId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/disruptions`, async (req, res) => {
		const { disruptionId } = req.query;

		const apiName = 'Delete Disruptions API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
	
			const requiredFields = [
				'disruptionId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'disruptions', { _id: mongo.getObjectId(disruptionId) });
				if (deleteResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						message: 'Disruption deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Disruption not deleted'
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