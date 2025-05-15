const mongo = require('../utilities/mongodb');
const { validateRequiredFields } = require('../utilities/validation');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	// Get All Shops API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const apiName = 'Get All Shops API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const shopResult = await mongo.find(mongoClient, 'shops');

			if (shopResult) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: shopResult
				});
			} else {
				console.log(`❌ ${apiName} Response Failed.`);
				res.status(404).send({
					status: 404,
					message: 'Shops not found',
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

	// Create Shops API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const apiName = 'Create Shops API';
		const {
			name,
			category,
			status,
			owner,
			contact,
			images,
			location,
			openingHours,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'name',
				'category',
				'status',
				'owner',
				'contact',
				'images',
				'location',
				'openingHours',
			];
			if (!validateRequiredFields(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create shop
				const inputShop = {
					name,
					category,
					status,
					owner,
					contact,
					images,
					location,
					openingHours,
					createdAt: new Date(),
				};
				const inputResult = await mongo.insertOne(mongoClient, 'shops', inputShop);
				if (inputResult) {
					console.log(`${apiName} MongoDB Success.`);
					return res.status(200).json({
						message: 'Shop created successfully',
						adminId: inputResult.insertedId,
					});
				} else {
					console.error('❌ Error creating shop.');
					res.status(404).send({
						status: 404,
						message: 'Error creating shop.',
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

	// Update Shops API by shopId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/shops/:shopId`, async (req, res) => {
		const { shopId } = req.params;
		const {
			name,
			category,
			status,
			owner,
			contact,
			images,
			location,
			openingHours,
		} = req.body;

		const apiName = 'Update Shops API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!shopId) {
				console.log(`❌ ${apiName} Bad request: shopId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: shopId is a required parameter.',
				});
			} else {
				const updateObj = {};

				if (name) updateObj.name = name;
				if (category) updateObj.category = category;
				if (status) updateObj.stack = status;
				if (owner) updateObj.owner = owner;
				if (contact) updateObj.contact = contact;
				if (images) updateObj.images = images;
				if (location) updateObj.location = location;
				if (openingHours) updateObj.openingHours = openingHours;
				updateObj.updatedAt = new Date();

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'shops', { _id: mongo.getObjectId(shopId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Shop not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Shop updated successfully.',
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

	// Delete Shops API by shopId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/shops/:shopId`, async (req, res) => {
		const { shopId } = req.params;

		const apiName = 'Delete Shops API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!shopId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: shopId is a required parameters.',
				});
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'shops', { _id: mongo.getObjectId(shopId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Shop deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Shop not deleted'
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