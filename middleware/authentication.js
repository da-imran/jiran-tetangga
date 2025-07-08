module.exports = (req, res, next) => {
	const apiKey = req.headers['x-api-key'];
	const secretsApiKey = process.env.API_KEY;

	if (!apiKey) {
		return res.status(401).json({ error: 'Missing X-API-Key header' });
	}

	if (apiKey !== secretsApiKey) {
		return res.status(403).json({ error: 'Invalid API Key' });
	}

	next();
};