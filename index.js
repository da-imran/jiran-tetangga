const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
const API_VERSION = process.env.API_VERSION;
const APP_VERSION = process.env.APP_VERSION;
const VERSION = process.env.VERSION;

console.log(`[index.js Startup] ROUTE_PREPEND: "${ROUTE_PREPEND}"`);
console.log(`[index.js Startup] VERSION: "${VERSION}"`);
console.log(`[index.js Startup] API_VERSION: "${API_VERSION}"`);
console.log(`[index.js Startup] APP_VERSION: "${APP_VERSION}"`);
console.log(`[index.js Startup] Expected API base path: "/${ROUTE_PREPEND}/${VERSION}"`);

module.exports = async (app, config) => {
	app.get(`/${ROUTE_PREPEND}/${VERSION}`, (_, res) => {
		try {
			console.log('Default endpoint probed.');
			res.send({
				status: 200,
				message: 'Route is working',
				data: {
					apiVersion: API_VERSION,
					appVersion: APP_VERSION,
				},
			});
		} catch (err) {
			res.status(500).send('Default endpoint failure!!');
		}
	});
	require('./modules/adminUsers')(app, config);
	require('./modules/reports')(app, config);
	require('./modules/disruptions')(app, config);
	require('./modules/events')(app, config);
	require('./modules/shops')(app, config);
	require('./modules/parks')(app, config);
};
