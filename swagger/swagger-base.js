// swagger/swagger-base.js
require('dotenv').config();

const HOSTNAME = process.env.HOSTNAME || 'localhost';
const PORT = process.env.PORT || 3500;
const ROUTE_PREPEND = process.env.ROUTE_PREPEND || 'jiran-tetangga';
const VERSION = process.env.VERSION || 'v1';

module.exports = {
	info: {
		title: 'Jiran Tetangga API',
		description: 'API Documentation',
		version: '1.0.0'
	},
	host: `${HOSTNAME}:${PORT}`,
	basePath: `/${ROUTE_PREPEND}/${VERSION}`,
	schemes: ['http'],
	consumes: ['application/json'],
	produces: ['application/json'],
	securityDefinitions: {
		apiKeyAuth: {
			type: 'apiKey',
			in: 'header',
			name: 'x-api-key',
			description: 'API Key required to access the documentation'
		}
	},
	security: [
		{
			apiKeyAuth: []
		}
	],
};
