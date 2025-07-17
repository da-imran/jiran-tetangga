const { ObjectId } = require('mongodb');

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
		
		if (input[field] === null || input[field] === undefined) {
			console.error(`❌ Bad request: ${field} is a required parameter.`);
			res.status(400).send({
				status: 400,
				message: `Bad request: ${field} is a required parameter.`,
			});
			return false;
		}

		if (field.toLowerCase().endsWith('id')) {
			if (!ObjectId.isValid(input[field])) {
				console.error(`❌ Bad request: ${field} must be a valid ObjectId.`);
				res.status(400).send({
					status: 400,
					message: `Bad request: ${field} must be a valid ObjectId.`,
				});
				return false;
			}
		}
	}
	return true;
};

const invalidFieldCheck = (input, invalidFields, res) => {
	for (const field of invalidFields) {
		if (input[field]) {
			console.error(`❌ Bad request: ${field} cannot be updated.`);
			res.status(400).send({
				status: 400,
				message: `Bad request: ${field} cannot be updated.`,
			});
			return false;
		} 
	}
	return true;
};

module.exports = { requiredCheck, invalidFieldCheck }; 