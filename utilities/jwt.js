const jwt = require('jsonwebtoken');
const { secrets } = require('../utilities/secrets');

function signToken(payload) {
	const JWT_KEY = secrets.JWT_KEY.value;  
	return jwt.sign(payload, JWT_KEY, { expiresIn: '15m' });
}

function verifyToken(token) {
	const JWT_KEY = secrets.JWT_KEY.value;
	return jwt.verify(token, JWT_KEY);
}

module.exports = { signToken, verifyToken };
