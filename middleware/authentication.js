const { signToken } = require('../utilities/jwt');
const mongo = require('../utilities/mongodb');
const CryptoJS = require('crypto-js');
const { secrets } = require('../utilities/secrets');

module.exports = (app, config) => {
	const { mongoClient } = config;
	const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
	const VERSION = process.env.VERSION;
	const ENCRYPTION_KEY = secrets.ENCRYPTION_KEY.value;

	app.post(`/${ROUTE_PREPEND}/${VERSION}/auth/login`, async (req, res) => {
		const { email, password } = req.body;
		try {
			const user = await mongo.findOne(mongoClient, 'admin_user', { email });
			if(!user) return res.status(401).json({ message: 'Invalid email or password!' });

			const decryptedPassword = CryptoJS.AES.decrypt(user.password, ENCRYPTION_KEY, {
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7,
			}).toString(CryptoJS.enc.Utf8);

			if (decryptedPassword !== password) {
				return res.status(401).json({ message: 'Invalid email or password!' });
			}

			const token = signToken({ id: mongo.getObjectId(user._id), email: user.email });
			const data = {
				email: user.email,
				token
			};
			console.log('Authentication Success');
			return res.status(200).json({ data });
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: 'Internal server error' });
		}
			
	});
};
