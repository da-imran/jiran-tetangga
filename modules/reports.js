const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

const reportStatus = {
	PENDING: 'pending',
	COMPLETED: 'completed',
	REJECTED: 'rejected'
};

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Reports API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/reports`, async (req, res) => {
		const apiName = 'Get All Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const reportsResult = await mongo.find(mongoClient, 'reports');

			if (reportsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: reportsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Reports not found',
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

	// Get Report by reportId API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/reports/:reportId`, async (req, res) => {
		const apiName = 'Get Report API';
		const { reportId } = req.params;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'reportId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
				return;
			} else {
				const reportsResult = await mongo.findOne(mongoClient, 'reports', { _id: mongo.getObjectId(reportId) });
				if (reportsResult) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: reportsResult
					});
				} else {
					console.log(`❌ ${apiName} Response Failed.`);
					res.status(404).send({
						status: 404,
						message: 'Report not found',
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

	// Create Reports API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/reports`, async (req, res) => {
		const apiName = 'Create Reports API';
		const {
			email,
			description,
			location,
			category,
			images,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'email',
				'category',
				'location',
				'description',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create report
				const inputReports = {
					email,
					description,
					location,
					category,
					images: images ?? null,
					status: reportStatus.PENDING,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'reports', inputReports);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Report created successfully',
						_id: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating report.');
					res.status(404).send({
						status: 404,
						message: 'Error creating report.',
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

	// Update Reports API by reportId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/reports/:reportId`, async (req, res) => {
		const { reportId } = req.params;
		const {
			email,
			description,
			location,
			category,
			images,
			status,
		} = req.body;

		const apiName = 'Update Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'reportId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
				return;
			} else {
				const updateObj = {};

				if (email) updateObj.email = email;
				if (description) updateObj.description = description;
				if (category) updateObj.category = category;
				if (location) updateObj.location = location;
				if (status) updateObj.status = status;
				if (images) updateObj.images = images;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'reports', { _id: mongo.getObjectId(reportId) }, updateObj);
				if (!updateResult) {
					console.error(`❌ ${apiName} failed!`);
					res.status(404).send({
						status: 404,
						message: 'Update report failed!'
					});
				} else {
					console.log(`${apiName} MongoDB Success.`);
					res.status(200).send({
						status: 200,
						message: 'Report updated successfully.',
						data: JSON.parse(JSON.stringify(updateResult)),
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			console.error(`❌ ${apiName} Failed to update`);
			res.status(500).send({
				status: 500,
				message: `${apiName} Failed to update`,
				error,
			});
		}
	});

	// Delete Reports API by reportId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/reports/:reportId`, async (req, res) => {
		const { reportId } = req.params;

		const apiName = 'Delete Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'reportId',
			];
			if (!requiredCheck(req.params, requiredFields, res)) {
				return;
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'reports', { _id: mongo.getObjectId(reportId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Report deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Report not deleted'
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