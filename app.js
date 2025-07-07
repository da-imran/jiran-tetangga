const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const mongodb = require('./utilities/mongodb');
const loadModules = require('./index');

const app = express();

/* Middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
	origin: '*',
	methods: 'PATCH, POST, GET, DELETE, OPTIONS, PUT',
	allowedHeaders: 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key'
}));

(async () => {
	const mongoClient = await mongodb.clientConnect(process.env.MONGO_URI);
	
	const config = { mongoClient };

	// Load routes/modules after MongoDB is ready
	await loadModules(app, config);

	app.get('/', (req, res) => res.send('JiranTetangga Backend Running'));
})();

module.exports = { app };
