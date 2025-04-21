const mongo = require('../utilities/mongodb');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Reports API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/reports`, async (req, res) => {
		const apiName = 'Get All Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const reportsResult = await mongo.find(mongoClient, 'events');

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

	// Create Reports API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/reports`, async (req, res) => {
		const apiName = 'Create Reports API';
		const {
			residentId,
			title,
			description,
			category,
			status,
			location,
			images,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!residentId) {
				console.log(`❌ ${apiName} Bad request: residentId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: residentId is a required parameter.',
				});
			} else if (!title) {
				console.log(`❌ ${apiName} Bad request: title is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: title is a required parameter.',
				});
			} else if (!category) {
				console.log(`❌ ${apiName} Bad request: category is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: category is a required parameter.',
				});
			} else if (!status) {
				console.log(`❌ ${apiName} Bad request: status is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: status is a required parameter.',
				});
			} else if (!images) {
				console.log(`❌ ${apiName} Bad request: images is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: images is a required parameter.',
				});
			} else {
				// 🔎 Proceed to create report
				const inputReports = {
					residentId,
					title,
					description,
					category,
					status,
					location,
					images,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'reports', inputReports);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Report created successfully',
						adminId: inputResult.insertedId,
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
			title,
			description,
			category,
			status,
			location,
			images,
		} = req.body;

		const apiName = 'Update Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!reportId) {
				console.log(`❌ ${apiName} Bad request: reportId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: reportId is a required parameter.',
				});
			} else if (!title) {
				console.log(`❌ ${apiName} Bad request: title is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: title is a required parameter.',
				});
			} else if (!category) {
				console.log(`❌ ${apiName} Bad request: category is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: category is a required parameter.',
				});
			} else if (!status) {
				console.log(`❌ ${apiName} Bad request: status is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: status is a required parameter.',
				});
			} else if (!images) {
				console.log(`❌ ${apiName} Bad request: images is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: images is a required parameter.',
				});
			} else {
				const updateObj = {};

				if (title) updateObj.title = title;
				if (description) updateObj.description = description;
				if (category) updateObj.category = category;
				if (location) updateObj.location = location;
				if (status) updateObj.status = status;
				if (images) updateObj.images = images;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'reports', { _id: mongo.getObjectId(reportId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Report not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Report updated successfully.',
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

	// Delete Reports API by reportId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/reports/:reportId`, async (req, res) => {
		const { reportId } = req.params;

		const apiName = 'Delete Reports API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!reportId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: reportId is a required parameters.',
				});
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