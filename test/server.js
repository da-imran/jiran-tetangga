const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const authentication = require('../middleware/authentication');
const mongodb = require('../utilities/mongodb');
dotenv.config();

const app = express();

const environment = process.env.RUN_ENV || 'test';

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

app.use((req, res, next) => {
	if (environment === 'local') return next();

	const excludedPaths = ['/', '/jiran-tetangga/v1'];
	if (excludedPaths.includes(req.path)) return next();

	return authentication(req, res, next);
});

module.exports = async () => {
	const mongoClient = await mongodb.clientConnect(process.env.MONGO_URI);
	const config = { mongoClient };
	
	require('../index')(app, config); // mount all routes

	return app;
};