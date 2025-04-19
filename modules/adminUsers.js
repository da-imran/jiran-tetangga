const mongo = require('../utilities/mongodb');
const CryptoJS = require('crypto-js');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;

	const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;


	// Get all Administrator user details or filter by the email
	app.get(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`, async (req, res) => {
		const { email } = req.query;
		const apiName = 'Get Admin User API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			const filter = {};
			if (email) filter.email = email;

			const adminUser = await mongo.aggregate(mongoClient, 'admin_user', [
				{ $match: filter } // Filter by email if provided
			]);

			if (adminUser) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: adminUser
				});
			} else {
				console.log(`❌ ${apiName} failed to fetch the admin user. Admin User not found.`);
				res.status(404).send({
					status: 404,
					message: 'Admin user not found',
				});
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

	// Create Administrator user details by the UserId
	app.post(`/${ROUTE_PREPEND}/v1/adminUsers`, async (req, res) => {
		const {
			firstName,
			lastName,
			email,
			password,
			phone,
		} = req.body;
		const apiName = 'Get Admin User by UserId API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!firstName) {
				console.log(`❌ ${apiName} Bad request: firstName is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: firstName is a required parameter.',
				});
			} else if (!lastName) {
				console.log(`❌ ${apiName} Bad request: lastName is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: lastName is a required parameter.',
				});
			} else if (!email) {
				console.log(`❌ ${apiName} Bad request: email is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: email is a required parameter.',
				});
			} else if (!password || typeof password !== 'string' || password.length < 8) {
				console.log(`❌ ${apiName} Bad request: Password is required and must be at least 8 characters.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: Password is required and must be at least 8 characters.',
				});
			} else if (!phone) {
				console.log(`❌ ${apiName} Bad request: phone is a required parameter.`);

				res.status(400).send({
					status: 400,
					message: 'Bad request: phone is a required parameter.',
				});
			} else {
				// 🔎 Check for duplicate email
				const existingUser = await mongo.findOne(mongoClient, 'admin_user', { email });
				if (existingUser) {
					console.log(`❌ ${apiName} Bad request: duplicate admin email exists.`);

					res.status(400).send({
						status: 400,
						message: 'Bad request: duplicate admin email exists.',
					});
				} else {
					// 🔐 Encrypt password
					const encryptPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY, { mode: CryptoJS.mode.ECB }).toString();
					const newAdmin = {
						firstName,
						lastName,
						email,
						password: encryptPassword,
						phone,
						createdAt: new Date(),
					};

					const inputResult = await mongo.insertOne(mongoClient, 'admin_user', newAdmin);
					if (inputResult) {
						return res.status(200).json({
							message: 'Administrator created successfully',
							adminId: inputResult.insertedId,
						});
					} else {
						console.error('❌ Error creating admin user.');
						res.status(404).send({
							status: 404,
							message: 'Error creating admin user.',
						});
					}
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: 'Failed to Create Administrator user',
				error,
			});
		}
	});

	// Update Administrator user by UserId
	app.patch(`/${ROUTE_PREPEND}/v1/adminUsers/:adminUserId`, async (req, res) => {
		const { adminUserId } = req.params;
		const { 
			firstName,
			lastName,
			phone,
			email
		} = req.body;

		const apiName = 'Update Admin User by UserId API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (phone) {
				res.status(400).send({
					status: 400,
					message: 'Phone number of the administrator user cannot be updated.',
				});
			} else if (email) {
				res.status(400).send({
					status: 400,
					message: 'Email of the administrator user cannot be updated.',
				});
			} else {
				const updateObj = {};

				if (firstName) updateObj.firstName = firstName;
				if (lastName) updateObj.lastName = lastName;

				const updateResult = await mongo.findOneAndUpdate(mongoClient, 'admin_user', { _id: mongo.getObjectId(adminUserId) }, updateObj);
				if (!updateResult) {
					res.status(404).send({
						status: 404,
						message: 'Admin user not updated'
					});
				} else {
					res.status(200).send({
						status: 200,
						message: 'Admin user updated successfully.',
						data: JSON.parse(JSON.stringify(updateResult)),
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: 'Failed to Update Administrator user',
				error,
			});
		}
	});

	// Delete Administrator user by UserId
	app.delete(`/${ROUTE_PREPEND}/v1/adminUsers/:adminUserId`, async (req, res) => {
		const { adminUserId } = req.params;

		const apiName = 'Delete Admin User by UserId API';
		try {
			console.log(`${apiName} is called at ${new Date()}}`);

			if (!adminUserId) {
				res.status(400).send({
					status: 400,
					message: 'Bad Request: adminUserId is a required parameters.',
				});
			} else {
				const deleteResult = await mongo.deleteOne(mongoClient, 'admin_user', { _id: mongo.getObjectId(adminUserId) });
				if (deleteResult) {
					res.status(200).send({
						status: 200,
						message: 'Admin user deleted successfully.',
						data: {
							adminUser: deleteResult
						},
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Admin user not deleted'
					});
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: 'Failed to Delete Administrator user',
				error,
			});
		}
	});
};