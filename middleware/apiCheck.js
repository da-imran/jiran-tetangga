const { secrets } = require('../utilities/secrets');

module.exports = (req, res, next) => {
	const clientApiKey = req.headers['x-api-key'];
	const API_KEY = secrets.API_KEY?.value;

	if (!clientApiKey || clientApiKey !== API_KEY) {
		console.warn('⚠️ Invalid or missing API key');
		return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
	}

	next();
};