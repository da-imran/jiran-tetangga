const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const mongodb = require('./utilities/mongodb');
const authentication = require('./middleware/authentication');
const loadModules = require('./index');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, X-API-Key'
}));

// Global for all routes
const environment = process.env.NODE_ENV || process.env.RUN_ENV;
app.use((req, res, next) => {
	// When running locally i.e. npm run dev
	if(environment === 'local')
	{
		return next();
	} else {
		// When running via docker
		const excludedPaths = ['/', '/jiran-tetangga/v1'];
		if (excludedPaths.includes(req.path)) {
			return next();
		}
		return authentication(req, res, next);
	}
});

(async () => {
	const mongoClient = await mongodb.clientConnect(process.env.MONGO_URI);
	
	const config = { mongoClient };

	// Load routes/modules after MongoDB is ready
	await loadModules(app, config);

	app.get('/', (req, res) => res.send('JiranTetangga Backend Running'));
})();

module.exports = { app };
