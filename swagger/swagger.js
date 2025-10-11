// swagger/swagger.js
const fs = require('fs');
const path = require('path');
const swaggerAutogen = require('swagger-autogen')();
const base = require('./swagger-base.js'); // now JS-based

const modulesDir = path.join(__dirname, '../modules');

const moduleTags = fs
	.readdirSync(modulesDir)
	.filter(f => f.endsWith('.js'))
	.map(f => ({
		name: path.basename(f, '.js'),
		description: `Endpoints for ${path.basename(f, '.js')} module`
	}));

const doc = {
	...base,
	tags: moduleTags
};

const outputFile = path.join(__dirname, 'swagger-output.json');
const endpointsFiles = [path.join(__dirname, '../index.js')];

swaggerAutogen(outputFile, endpointsFiles, doc)
	.then(() => console.log('✅ Swagger documentation generated.'));
