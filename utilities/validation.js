const requiredCheck = (input, requiredFields, res) => {
	for (const field of requiredFields) {
		if (!input[field]) {
			console.error(`❌ Bad request: ${field} is a required parameter.`);
			res.status(400).send({
				status: 400,
				message: `Bad request: ${field} is a required parameter.`,
			});
			return false;
		}
	}
	return true;
};

module.exports = { requiredCheck }; 