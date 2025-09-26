const jwt = require('jsonwebtoken');
const { secrets } = require('../utilities/secrets');

function signToken(payload) {
	const JWT_KEY = secrets.JWT_KEY && secrets.JWT_KEY.value;
	if (!JWT_KEY) throw new Error('JWT_KEY is not initialized');
	return jwt.sign(payload, JWT_KEY, { algorithm: 'HS256', expiresIn: '15m' });
}

function verifyToken(token) {
	const JWT_KEY = secrets.JWT_KEY && secrets.JWT_KEY.value;
	if (!JWT_KEY) throw new Error('JWT_KEY is not initialized');
	return jwt.verify(token, JWT_KEY, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };
