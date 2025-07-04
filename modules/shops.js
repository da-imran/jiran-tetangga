const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');

const shopStatus = {
	OPEN: 'open',
	CLOSED: 'closed',
	MAINTENANCE: 'maintenance'
};

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

	// Get Shop by shopId API
	app.get(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const apiName = 'Get Shop API';
		const { shopId } = req.query;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'shopId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
			} else {
				const shopResult = await mongo.find(mongoClient, 'shops', { _id: mongo.getObjectId(shopId) });
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
						message: 'Shop not found',
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

	// Create Shops API
	app.post(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const apiName = 'Create Shops API';
		const {
			name,
			description,
			category,
			images,
			location,
			openingHours,
		} = req.body;
		try {
			console.log(`${apiName} is called at ${new Date()}}`);
			const requiredFields = [
				'name',
				'description',
				'category',
				'images',
				'location',
				'openingHours',
			];
			if (!requiredCheck(req.body, requiredFields, res)) {
				return;
			} else {
				// 🔎 Proceed to create shop
				const inputShop = {
					name,
					description,
					category,
					status: shopStatus.CLOSED, // Set the status to CLOSED by default
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
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const { shopId } = req.query;
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

			const requiredFields = [
				'shopId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
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
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/shops`, async (req, res) => {
		const { shopId } = req.query;

		const apiName = 'Delete Shops API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const requiredFields = [
				'shopId',
			];
			if (!requiredCheck(req.query, requiredFields, res)) {
				return;
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