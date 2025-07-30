const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongodb = require('../utilities/mongodb');
const { checkSecretObjectNull, secrets } = require('../utilities/secrets');
dotenv.config();

const ENVIRONMENT = process.env.NODE_ENV || 'local';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

module.exports = async () => {
	const secretsLoaded = await checkSecretObjectNull();
	if (!secretsLoaded) {
		console.error('❌ Critical secrets could not be loaded from Infisical. Exiting...');
		process.exit(1);
	}
	const mongoUri = ENVIRONMENT === 'local' ? process.env.MONGO_URI : secrets.MONGO_URI.value;
	const mongoClient = await mongodb.clientConnect(mongoUri);
	const config = { mongoClient };
	
	await require('./testIndex')(app, config); // mount all routes

	return app;
};