const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongodb = require('../utilities/mongodb');
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

module.exports = async () => {
	const mongoClient = await mongodb.clientConnect(process.env.MONGO_URI);
	const config = { mongoClient };
	
	await require('./testIndex')(app, config); // mount all routes

	return app;
};