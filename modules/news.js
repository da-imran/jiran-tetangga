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
	app.get(`/${ROUTE_PREPEND}/${VERSION}/news`, async (req, res) => {
		const apiName = 'Get News API';
		const { newsId } = req.query;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'newsId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
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
				'description',
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
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/news`, async (req, res) => {
		const { newsId } = req.query;
		const {
			title,
			description,
			category,
			status,
			adminId,
		} = req.body;

		const apiName = 'Update News API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			
			const requiredFields = [
				'newsId',
				'adminId',
			];

			const dataToValidate = { ...req.query, ...req.body };
			if (!requiredCheck(dataToValidate, requiredFields, res)) {
				return;
			} else {
				const updateObj = {};

				if (title) updateObj.title = title;
				if (category) updateObj.category = category;
				if (description) updateObj.description = description;
				if (status) updateObj.status = status;
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
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/news`, async (req, res) => {
		const { newsId } = req.query;

		const apiName = 'Delete News API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
	
			const requiredFields = [
				'newsId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
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