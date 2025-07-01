const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

const newCategory = {
	INFO: 'informational', // More like general news, tips, the default value
	UPDATE: 'update', // Follow-up information for a certain situation
	EVENT: 'event', // Information for specific event i.e. pasar malam, gotong royong
	ANNOUNCEMENT: 'announcement', // Official statements, or updates
	WARNING: 'warning', // Alerts on potential issues or riskk
	ALERT: 'alert', // More urgent or critical notification than warning
	EMERGENCT: 'emergency' // Highest level of urgency, indicating serious situation
};

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All News API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/news`, async (req, res) => {
		const apiName = 'Get All News API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const newsResult = await mongo.find(mongoClient, 'news');

			if (newsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: newsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'News not found',
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

	// Get New by newsId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/news/:newsId`, async (req, res) => {
		const apiName = 'Get News API';
		const { newsId } = req.params;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const newsResult = await mongo.find(mongoClient, 'news', {_id: mongo.getObjectId(newsId)});

			if (newsResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: newsResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'News not found',
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

	// Create News API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/news`, async (req, res) => {
		const apiName = 'Create News API';
		const {
			title,
			description,
			adminId,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'title',
				'descripiton',
				'adminId',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create shop
				const inputNews = {
					title,
					description,
					status: false, // Set false as default value for inactive
					category: newCategory.INFO,
					createdBy: mongo.getObjectId(adminId),
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'news', inputNews);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'News created successfully',
						adminId: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating news.');
					res.status(404).send({
						status: 404,
						message: 'Error creating news.',
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

	// Update News API by shopId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/news/:newsId`, async (req, res) => {
		const { newsId } = req.params;
		const {
			title,
			message,
			category,
			visibility,
			adminId,
		} = req.body;

		const apiName = 'Update News API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!newsId) {
				console.log(`❌ ${apiName} Bad request: newsId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: newsId is a required parameter.',
				});
			} else if (!adminId) {
				console.log(`❌ ${apiName} Bad request: adminId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: adminId is a required parameter.',
				});
			} else {
				const updateObj = {};

				if (title) updateObj.title = title;
				if (category) updateObj.category = category;
				if (message) updateObj.message = message;
				if (visibility) updateObj.visibility = visibility;
				if (adminId) updateObj.adminId = adminId;
				updateObj.updatedAt = new Date();

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'news', { _id: mongo.getObjectId(newsId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'News not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'News updated successfully.',
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

	// Delete News API by shopId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/news/:newsId`, async (req, res) => {
		const { newsId } = req.params;

		const apiName = 'Delete News API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!newsId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: newsId is a required parameters.',
				});
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'news', { _id: mongo.getObjectId(newsId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'News deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'News not deleted'
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