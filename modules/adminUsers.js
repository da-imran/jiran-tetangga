const mongo = require('../utilities/mongodb');
const CryptoJS = require('crypto-js');
const { requiredCheck } = require('../utilities/validation');
const { secrets } = require('../utilities/secrets');
const { logger, LOG_LEVELS } = require('../utilities/logger');
const { MODULES, METHODS } = require('../utilities/constants');
const { v4: uuidv4 } = require('uuid');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;
	const SERVICE_NAME = process.env.SERVICE_NAME;
	const MODULE = MODULES.ADMINISTRATOR;

	const ENCRYPTION_KEY = secrets.ENCRYPTION_KEY.value;

	// Get all Administrator user details
	app.get(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get All Admin Users API';

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.GET,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});
		try {
			const adminUser = await mongo.find(mongoClient, 'admin_user',{}, 
				{ 
					_id: 1,
					firstName: 1,
					lastName: 1,
					createdAt: 1
				}
			);
			if (adminUser) {
				console.log(`${apiName} Response Success.`);
				res.status(200).send({
					status: 200,
					data: adminUser
				});
				logger.log({
					service: SERVICE_NAME,
					module: MODULE,
					apiName,
					status: 200,
					message: 'Response Success.',
					data: adminUser,
					traceId,
					level: LOG_LEVELS.INFO,
				});
			} else {
				console.log(`❌ ${apiName} failed to fetch the admin user. Admin User not found.`);
				res.status(404).send({
					status: 404,
					message: 'Admin user not found',
				});
				logger.log({
					service: SERVICE_NAME,
					module: MODULE,
					apiName,
					status: 404,
					message: 'Admin user not found',
					data: adminUser,
					traceId,
					level: LOG_LEVELS.INFO,
				});
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});
			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: err.message,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Get Administrator user details by UserId
	app.get(`/${ROUTE_PREPEND}/${VERSION}/adminUser/:adminUserId`, async (req, res) => {
		const traceId = uuidv4();
		const { adminUserId } = req.params;
		const apiName = 'Get Admin User API';

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.GET,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});
		try {
			const requiredFields = [
				'adminUserId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
			} else {
				const adminUser = await mongo.findOne(mongoClient, 'admin_user', { _id: mongo.getObjectId(adminUserId) },
					{
						_id: 1,
						firstName: 1,
						lastName: 1,
						createdAt: 1
					});
				if (adminUser) {
					console.log(`${apiName} Response Success.`);
					res.status(200).send({
						status: 200,
						data: adminUser
					});
					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Response Success.',
						data: adminUser,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					console.log(`❌ ${apiName} failed to fetch the admin user. Admin user not found.`);
					res.status(404).send({
						status: 404,
						message: 'Admin user not found',
					});
					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Admin user not found',
						traceId,
						level: LOG_LEVELS.ERROR,
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
			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Create Administrator user details by the UserId
	app.post(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Get Admin User by UserId API';
		const {
			firstName,
			lastName,
			email,
			password,
			phone,
		} = req.body;

		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.POST,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});
		try {
			const requiredFields = [
				'firstName',
				'lastName',
				'email',
				'password',
				'phone',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.body, requiredFields, res, config)) {
				return;
			} else {
				// 🔎 Check for duplicate email
				const existingUser = await mongo.findOne(mongoClient, 'admin_user', { email });
				if (existingUser) {
					console.log(`❌ ${apiName} Bad request: duplicate admin email exists.`);
					res.status(400).send({
						status: 400,
						message: 'Bad request: duplicate admin email exists.',
					});
					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 400,
						message: 'Bad request: duplicate admin email exists.',
						traceId,
						level: LOG_LEVELS.ERROR,
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
						console.log(`${apiName} Response Success.`);
						res.status(200).json({
							message: 'Administrator created successfully',
							adminId: inputResult.insertedId,
						});

						logger.log({
							service: SERVICE_NAME,
							module: MODULE,
							apiName,
							status: 200,
							message: 'Response Success.',
							data: inputResult,
							traceId,
							level: LOG_LEVELS.INFO,
						});
					} else {
						console.error('❌ Error creating admin user.');
						res.status(404).send({
							status: 404,
							message: 'Error creating admin user.',
						});

						logger.log({
							service: SERVICE_NAME,
							module: MODULE,
							apiName,
							status: 404,
							message: 'Error creating admin user.',
							data: inputResult,
							traceId,
							level: LOG_LEVELS.ERROR,
						});
					}
				}
			}
		} catch (err) {
			const error = { message: err.message, stack: err.stack };
			res.status(500).send({
				status: 500,
				message: `${apiName} error`,
				error,
			});

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});

	// Update Administrator user by UserId
	app.patch(`/${ROUTE_PREPEND}/${VERSION}/adminUsers/:adminUserId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Update Admin User by UserId API';
		const { adminUserId } = req.params;
		const { 
			firstName,
			lastName,
		} = req.body;
	
		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.PATCH,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});

		try {
			const requiredFields = [
				'adminUserId',
			];
			const dataToValidate = { ...req.params, ...req.body };
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(dataToValidate, requiredFields, res, config)) {
				return;
			} else {
				const updateObj = {};

				if (firstName) updateObj.firstName = firstName;
				if (lastName) updateObj.lastName = lastName;

				const adminUser = await mongo.findOne(mongoClient, 'admin_user', { _id: mongo.getObjectId(adminUserId) });
				if(!adminUser) {
					console.log(`❌ ${apiName} User not found!`);
					res.status(404).send({
						status: 404,
						message: 'User not found'
					});
				} else {
					const updateResult = await mongo.findOneAndUpdate(mongoClient, 'admin_user', { _id: mongo.getObjectId(adminUserId) }, updateObj);
					if (!updateResult) {
						console.log(`❌ ${apiName} Admin user not updates.`);
						res.status(404).send({
							status: 404,
							message: 'Admin user not updated'
						});
					} else {
						console.log(`${apiName} Response Success.`);
						res.status(200).send({
							status: 200,
							message: 'Admin user updated successfully.',
							data: JSON.parse(JSON.stringify(updateResult)),
						});
					}
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

	// Delete Administrator user by UserId
	app.delete(`/${ROUTE_PREPEND}/${VERSION}/adminUsers/:adminUserId`, async (req, res) => {
		const traceId = uuidv4();
		const apiName = 'Delete Admin User by UserId API';
		const { adminUserId } = req.params;
		
		console.log(`${apiName} is called at ${new Date()}`);
		logger.log({
			service: SERVICE_NAME,
			module: MODULE,
			apiName,
			method: METHODS.DELETE,
			status: 200,
			message: `${apiName} is called at ${new Date()}`,
			traceId,
			level: LOG_LEVELS.INFO,
		});
		try {
			const requiredFields = [
				'adminUserId',
			];
			const config = {
				traceId,
				MODULE,
				apiName,
			};
			if (!requiredCheck(req.params, requiredFields, res, config)) {
				return;
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

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 200,
						message: 'Admin user deleted successfully.',
						data: deleteResult,
						traceId,
						level: LOG_LEVELS.INFO,
					});
				} else {
					res.status(404).send({
						status: 404,
						message: 'Admin user not deleted'
					});

					logger.log({
						service: SERVICE_NAME,
						module: MODULE,
						apiName,
						status: 404,
						message: 'Admin user not deteled',
						traceId,
						level: LOG_LEVELS.ERROR,
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

			logger.log({
				service: SERVICE_NAME,
				module: MODULE,
				apiName,
				status: 500,
				message: error,
				traceId,
				level: LOG_LEVELS.ERROR,
			});
		}
	});
};