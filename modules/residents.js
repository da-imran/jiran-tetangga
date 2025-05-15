const mongo = require('../utilities/mongodb');
const { validateRequiredFields } = require('../utilities/validation');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Residents API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/residents`, async (req, res) => {
		const apiName = 'Get All Residents API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const residentsResult = await mongo.find(mongoClient, 'residents');

			if (residentsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: residentsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Residents not found',
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

	// Create Residents API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/residents`, async (req, res) => {
		const apiName = 'Create Residents API';
		const {
			firstName,
			lastName,
			email,
			phone,
			address,
			unitNo,
			role,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'firstName',
				'lastName',
				'email',
				'phone',
				'address',
				'unitNo',
				'role',
			];
			if (!validateRequiredFields(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create resident
				const inputResidents = {
					firstName,
					lastName,
					email,
					phone,
					address,
					unitNo,
					role,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'residents', inputResidents);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Resident created successfully',
						adminId: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating resident.');
					res.status(404).send({
						status: 404,
						message: 'Error creating resident.',
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

	// Update Residents API by reportId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/residents/:residentId`, async (req, res) => {
		const { residentId } = req.params;
		const {
			firstName,
			lastName,
			email,
			phone,
			address,
			unitNo,
			role,
		} = req.body;

		const apiName = 'Update Residents API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!residentId) {
				console.log(`❌ ${apiName} Bad request: residentId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: residentId is a required parameter.',
				});
			} else {
				const updateObj = {};

				if (firstName) updateObj.firstName = firstName;
				if (lastName) updateObj.lastName = lastName;
				if (email) updateObj.email = email;
				if (phone) updateObj.phone = phone;
				if (address) updateObj.address = address;
				if (unitNo) updateObj.unitNo = unitNo;
				if (role) updateObj.role = role;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'residents', { _id: mongo.getObjectId(residentId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Resident not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Resident updated successfully.',
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

	// Delete Residents API by reportId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/residents/:residentId`, async (req, res) => {
		const { residentId } = req.params;

		const apiName = 'Delete Residents API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!residentId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: residentId is a required parameters.',
				});
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'residents', { _id: mongo.getObjectId(residentId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Resident deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Resident not deleted'
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