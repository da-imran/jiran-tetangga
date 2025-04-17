const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const mongodb = require('./utilities/mongodb');
const loadModules = require('./index');

const app = express();

/* Middlewares */
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Methods', 'PATCH, POST, GET, DELETE, OPTIONS, PUT');
	  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-disposition, Content-Type, Accept, Authorization, x-api-key');
	  next();
});

// MongoDB Init
const config = {  
	db: mongodb,
};

// Load modules
loadModules(app, config);

app.get('/', (req, res) => res.send('Neighbourhood Info Backend Running'));

module.exports = { app };
