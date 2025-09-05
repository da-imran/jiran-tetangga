const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongodb = require('./utilities/mongodb');
const authentication = require('./middleware/authentication');
const apiKeyCheck = require('./middleware/apiCheck');
const { checkSecretObjectNull, secrets } = require('./utilities/secrets');
const { logger, LOG_LEVELS } = require('./utilities/logger');
dotenv.config();

const app = express();

// Global for all routes
const HOSTNAME = process.env.HOSTNAME || 'localhost';
const ROUTE_PREPEND = process.env.ROUTE_PREPEND || 'jiran-tetangga';
const VERSION = process.env.VERSION || 'v1';
const ENVIRONMENT = process.env.NODE_ENV || 'local';
const PORT = process.env.PORT || '3500';
const SERVICE_NAME = process.env.SERVICE_NAME;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

app.use((req, res, next) => {
	// When running locally
	if(ENVIRONMENT === 'local' || ENVIRONMENT === 'dev') return next();
	
	// When running via docker
	const excludedPaths = ['/', '/jiran-tetangga/v1'];
	if (excludedPaths.includes(req.path)) return next();
	
	return apiKeyCheck(req, res, next);
	
});

(async () => {
	try {
		const secretsLoaded = await checkSecretObjectNull();
		if (!secretsLoaded) {
			console.error('❌ Critical secrets could not be loaded from Infisical. Exiting...');
			logger.log({
				level: LOG_LEVELS.CRITICAL,
				message: 'Critical secrets could not be loaded from Infisical. Exiting...',
				status: 500,
				service: SERVICE_NAME,
			});
			process.exit(1);
		}

		const mongoUri = ENVIRONMENT === 'local' ? process.env.MONGO_URI : secrets.MONGO_URI.value;
		const mongoClient = await mongodb.clientConnect(mongoUri);
		const config = { mongoClient };

		authentication(app, config);

		// Load routes/modules after MongoDB is ready
		require('./index')(app, config);

		app.listen(PORT, '0.0.0.0', () => {
			console.log(`🚀 Backend running in ${ENVIRONMENT} mode on http://${HOSTNAME}:${PORT}/${ROUTE_PREPEND}/${VERSION}`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		logger.log({
			level: LOG_LEVELS.CRITICAL,
			message: error,
			status: 500,
			service: SERVICE_NAME,
		});
		process.exit(1);
	}
	
})();

module.exports = { app };