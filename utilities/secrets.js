const { InfisicalSDK } = require('@infisical/sdk');
require('dotenv').config();

const INFISICAL_URI = process.env.INFISICAL_URI || 'http://localhost:85';
const INFISICAL_ENV = process.env.INFISICAL_ENV || 'dev';
const INFISICAL_PROJECT_ID = process.env.INFISICAL_PROJECT_ID;
const INFISICAL_CLIENT_ID = process.env.INFISICAL_CLIENT_ID;
const INFISICAL_CLIENT_SECRET = process.env.INFISICAL_CLIENT_SECRET;

const secrets = {
	MONGO_URI: { name: 'MONGO_URI', value: null },
	ENCRYPTION_KEY: { name: 'ENCRYPTION_KEY', value: null },
	API_KEY: { name: 'API_KEY', value: null },
	JWT_KEY: { name: 'JWT_KEY', value: null }
};

let client;
// Setup to connect to client
const setupClient = async () => {
	if (client) return;

	client = new InfisicalSDK({
		siteUrl: INFISICAL_URI // optional if using public cloud
	});

	await client.auth().universalAuth.login({
		clientId: INFISICAL_CLIENT_ID,
		clientSecret: INFISICAL_CLIENT_SECRET
	});
};

// Get the secrets from the client
const getSecrets = async (secretsObj) => {
	await setupClient();

	for (const key in secretsObj) {
		if (Object.prototype.hasOwnProperty.call(secretsObj, key)) {
			try {
				const result = await client.secrets().getSecret({
					projectId: INFISICAL_PROJECT_ID,
					environment: INFISICAL_ENV,
					secretName: secretsObj[key].name,
					secretPath: '/',
				});

				secretsObj[key].value = result.secretValue;
			} catch (err) {
				console.error(`❌ Failed to fetch secret "${key}": ${err.message}`);
			}
		}
	}
};
const checkSecretObjectNull = async () => {
	await getSecrets(secrets);
	let valid = true;
	for (const key in secrets) {
		if (secrets[key].value === null) {
			console.warn(`⚠️ Missing secret: ${key}`);
			valid = false;
		}
	}
	return valid;
};

module.exports = {
	checkSecretObjectNull,
	secrets,
};