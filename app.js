const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongodb = require('./utilities/mongodb');
const authentication = require('./middleware/authentication');
dotenv.config();

const app = express();

// Global for all routes
const environment = process.env.NODE_ENV || process.env.RUN_ENV;
const PORT = process.env.PORT || '3500';

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

app.use((req, res, next) => {
	// When running locally
	if(environment === 'local') return next();
	else {
		// When running via docker
		const excludedPaths = ['/', '/jiran-tetangga/v1'];
		if (excludedPaths.includes(req.path)) {
			return next();
		}
		return authentication(req, res, next);
	}
});

(async () => {
	try {
		const mongoClient = await mongodb.clientConnect(process.env.MONGO_URI);
		const config = { mongoClient };

		// Load routes/modules after MongoDB is ready
		require('./index')(app, config);

		app.listen(PORT, '0.0.0.0', () => {
			console.log(`🚀 Backend running in ${environment} mode on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	}
	
})();

module.exports = { app };