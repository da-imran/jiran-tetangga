const jwt = require('jsonwebtoken');

const JWT_KEY = process.env.JWT_KEY;  
function signToken(payload) {
	return jwt.sign(payload, JWT_KEY, { 
		expiresIn: Math.floor(Date.now() / 1000) + (30 * 60) // Expiry in 30 mins
	});
}

function verifyToken(token) {
	return jwt.verify(token, JWT_KEY);
}

module.exports = { signToken, verifyToken };
