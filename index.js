const { logger, LOG_LEVELS } = require('./utilities/logger');

const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
const API_VERSION = process.env.API_VERSION;
const APP_VERSION = process.env.APP_VERSION;
const VERSION = process.env.VERSION;
const SERVICE_NAME = process.env.SERVICE_NAME;

module.exports = async (app, config) => {
	app.get(`/${ROUTE_PREPEND}/${VERSION}`, (_, res) => {
		try {
			console.log('Default endpoint probed.');
			logger.log({
				level: LOG_LEVELS.INFO,
				message: 'Default endpoint probed.',
				status: 200,
				service: SERVICE_NAME,
			});
			res.send({
				status: 200,
				message: 'Route is working',
				data: {
					apiVersion: API_VERSION,
					appVersion: APP_VERSION,
				},
			});
		} catch (err) {
			logger.log({
				level: LOG_LEVELS.ERROR,
				message: err.message,
				status: 500,
				service: SERVICE_NAME,
			});
			res.status(500).send('Default endpoint failure!!');
		}
	});
	require('./middleware/authentication')(app, config);
	require('./modules/adminUsers')(app, config);
	require('./modules/reports')(app, config);
	require('./modules/disruptions')(app, config);
	require('./modules/events')(app, config);
	require('./modules/shops')(app, config);
	require('./modules/parks')(app, config);
};
