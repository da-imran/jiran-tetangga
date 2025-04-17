const mongo = require('../utilities/mongodb');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.VERSION || 'trekrides';
	/**
     * Get Administrator user details by the userId
     */
	app.get(`/${ROUTE_PREPEND}/v1/adminUser/:firebaseUuid`, async (req, res) => {
		
		const { userId } = req.params;
		const apiName = 'Get Admin User by Firebase Uuid API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!userId) {
				console.log(`❌ ${apiName} Bad request: userId is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: userId is a required parameter.',
				});
			} else {
				const adminUser = await mongo.find(mongoClient, 'admin_user', { _id: mongo.getObjectId(userId) });
				console.log(`${apiName} MongoDB Response received.`);

				if (adminUser && adminUser[0]) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send(adminUser[0]);
				} else {
					console.log(`❌ ${apiName} failed to fetch the admin user. Admin User not found.`);
					res.status(404).send({
						status: 404,
						message: 'Admin user not found',
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: 'Failed to fetch admin user',
				error,
			});
		}
	});
};