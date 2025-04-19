const mongo = require('mongodb');
require('dotenv').config();

const { MongoClient } = mongo;

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

module.exports = {
	clientConnect: async () =>
		new Promise(async (resolve, reject) => {
			try {
				const client = new MongoClient(uri);
				await client.connect();
				console.log('✅ Connected to MongoDB');
				resolve(client);
			} catch (error) {
				console.error('❌ MongoDB connection failed:', error);
				reject(error);
			}
		}),
	getCollections: async (collectionName) =>
		new Promise(async (resolve, reject) => {
			try {
				const client = new MongoClient(uri);
				await client.connect();
				const db = client.db(db);
				const collection = db.collection(collectionName);
				console.log(`✅ MongoDB Fetched collection: ${collectionName}`);
				resolve(collection);
			} catch (error) {
				console.error(`❌ MongoDB Failed to get ${collectionName} collection:`, error);
				reject(error);
			}
		}),
	getObjectId: (str) => {
		try {
			const result = new mongo.ObjectId(str);
			console.log(`✅ MongoDB Fetched ObjectId: ${result}`);
			return result;
		} catch (error) {
			console.error('❌ MongoDB Failed to get ObjectId:', error);
			return 0;
		}
	},
	findOne: async (client, collectionName, parameters, projection) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.findOne({ ...parameters }, { projection });
			console.log(`✅ MongoDB findOne result: ${result}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB findOne process failed:', error);
			resolve(error);
		}
	}),
	insertOne: async (client, collectionName, insertInput, index = false, indexType = false) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			if (index && indexType) {
				await collection.createIndex({ [index]: indexType });
			}
			const result = await collection.insertOne({ ...insertInput });
			console.log(`✅ MongoDB insertOne result: ${result}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB insertOne process failed:', error);
			resolve(error);
		}
	}),
	findOneAndUpdate: async (client, collectionName, matchParameters, updateInput, updateOptions, unsetFields = {}) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.findOneAndUpdate({ ...matchParameters }, { $set: { ...updateInput }, $unset: { ...unsetFields } }, { ...updateOptions, returnDocument: 'after' });
			console.log(`✅ MongoDB findOneAndUpdate result: ${JSON.stringify(result)}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB findOneAndUpdate process failed:', error);
			resolve(error);
		}
	}),
	findOneAndUpdateInc: async (client, collectionName, matchParameters, updateInput, updateOptions = {}) => new Promise(async (resolve) => {
		// Increment field by a specific value
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.findOneAndUpdate({ ...matchParameters }, { $inc: { ...updateInput } }, { ...updateOptions, returnDocument: 'after' });
			console.log(`✅ MongoDB findOneAndUpdateInc result: ${result}`);
			resolve(result.value);
		} catch (error) {
			console.error('❌ MongoDB findOneAndUpdateInc process failed:', error);
			resolve(error);
		}
	}),
	updateOneInc: async (client, collectionName, matchParameters, updateInput) => new Promise(async (resolve) => {
		// Increment field by a specific value, used for objects only
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.findOneAndUpdate({ ...matchParameters }, { $inc: { ...updateInput } });
			console.log(`✅ MongoDB updateOneInc result: ${result}`);
			resolve(result.value);
		} catch (error) {
			console.error('❌ MongoDB updateOneInc process failed:', error);
			resolve(error);
		}
	}),
	findOneAndUpdateAddToSet: async (client, collectionName, matchParameters, updateInput, updateOptions) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.findOneAndUpdate({ ...matchParameters }, { $addToSet: { ...updateInput } }, { ...updateOptions, returnDocument: 'after' });
			console.log(`✅ MongoDB findOneAndUpdateAddToSet result: ${result}`);
			resolve(result.value);
		} catch (error) {
			console.error('❌ MongoDB findOneAndUpdateAddToSet process failed:', error);
			resolve(error);
		}
	}),
	updateMany: async (client, collectionName, matchParameters, updateInput, updateOptions) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.updateMany({ ...matchParameters }, { ...updateInput }, { ...updateOptions });
			console.log(`✅ MongoDB updateMany result: ${result}`);
			resolve(result.modifiedCount);
		} catch (error) {
			console.error('❌ MongoDB updateMany process failed:', error);
			resolve(error);
		}
	}),
	deleteOne: async (client, collectionName, matchParameters) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.deleteOne({ ...matchParameters });
			console.log(`✅ MongoDB deleteOne result: ${result}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB deleteOne process failed:', error);
			resolve(error);
		}
	}),
	aggregate: async (client, collectionName, pipelines) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const result = await collection.aggregate(pipelines).toArray();
			console.log(`✅ MongoDB aggregate result: ${result}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB aggregate process failed:', error);
			resolve(error);
		}
	}),
	find: async (client, collectionName, input, projection = {}) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const collection = db.collection(collectionName);
			const filter = { ...input };
			if (input._id) filter._id = new mongo.ObjectId.createFromHexString(input._id);
			const result = await collection.find({ ...filter }).project({ ...projection }).toArray();
			console.log(`✅ MongoDB find result: ${result}`);
			resolve(result);
		} catch (error) {
			console.error('❌ MongoDB find process failed:', error);
			resolve(error);
		}
	}),
	updateTimeSeries: async (client, collectionName, metaField, sessionDetails) => new Promise(async (resolve) => {
		try {
			const db = client.db(dbName);
			const timeseriesName = collectionName;
			const dbNames = await db.listCollections({ name: timeseriesName, type: 'timeseries' }).toArray();
			if (!dbNames.length) {
				db.createCollection(timeseriesName, {
					timeseries: {
						timeField: 'timeStamp',
						metaField,
						granularity: 'minutes',
					},
					expireAfterSeconds: 86400,
				});
			}
			const collection = db.collection(timeseriesName);
			const sessionUpdate = await collection.insertOne({ ...sessionDetails });
			console.log(`✅ MongoDB updateTimeSeries result: ${sessionUpdate}`);
			resolve(sessionUpdate);
		} catch (error) {
			console.error('❌ MongoDB updateTimeSeries process failed:', error);
			resolve(error);
		}
	}),
};
