/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoFx = require('../utilities/mongodb');
require('dotenv').config();

const should = chai.should();
chai.use(chaiHttp);

const ROUTE_PREPEND = process.env.ROUTE_PREPEND || 'jiran-tetanga';
const VERSION = process.env.VERSION || 'v1';

let server;
before(async () => {
	const appFactory = require('./server');
	server = await appFactory(); // Initialize app with mocked setup
});

afterEach(() => {
	sinon.restore(); // Restore stubs after each test
});

// Admin user Module
describe('🧪 ADM: Admin Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		firstName: 'Muhammad Ehsan',
		lastName: 'Imran',
		email: 'ehsan.imran@gmail.com',
		password: 'Ehsan123',
		phone: '0123456789'
	};

	const adminData = {
		_id: fakeId,
		firstName: 'Muhammad Ehsan',
		lastName: 'Imran',
		createdAt: new Date().toISOString()
	};

	it('ADM-001: POST - Create Admin User', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('adminId');
                    
				done();
			});
	});

	it('ADM-002: GET - Get All Admin Users', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(adminData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('ADM-003: GET - Get Admin User by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(adminData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/adminUser/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('ADM-004: PATCH - Update Admin User', (done) => {
		const updatedPayload = {
			firstName: 'Ehsan',
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/adminUsers/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('ADM-005: DELETE - Delete Admin User', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(adminData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/adminUsers/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});

});

// Road Disruptions Module
describe('🧪 DSP: Disruption Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		title: 'Jalan Cenderai Water Pipe Burst',
		category: 'informational',
		description: 'Jalan Cenderai Water Pipe Burst',
		adminId: '685fbecb335bdc41ca63fa4a'
	};

	const disruptionData = {
		_id: fakeId,
		title: 'Jalan Cenderai Water Pipe Burst',
		category: 'informational',
		description: 'Jalan Cenderai Water Pipe Burst',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	it('DSP-001: POST - Create Admin User', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/disruptions`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('_id');
                    
				done();
			});
	});

	it('DSP-002: GET - Get All Disruptions', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(disruptionData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/disruptions`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('DSP-003: GET - Get Disruption by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(disruptionData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/disruptions/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('DSP-004: PATCH - Update Disruption', (done) => {
		const updatedPayload = {
			status: true,
			adminId: '685fbecb335bdc41ca63fa4a'
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/disruptions/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('DSP-005: DELETE - Delete Disruption', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(disruptionData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/disruptions/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');
				
				done();
			});
	});

});

// Parks Module
describe('🧪 PRK: Park Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		name: 'Taman Permainan Sg Tiram',
		description: 'The park is closed until further notice',
		openingHours: {
			opening: '0000',
			closing: '0000'
		},
		adminId: '685fbecb335bdc41ca63fa4a'
	};

	const parkData = {
		_id: '686a81a642dfc8c72a77d5c6',
		name: 'Taman Rekreasi Sungai Tiram',
		description: 'Jogging track in the park closed for maintenance.',
		status: 'maintenance',
		openingHours: {
			opening: '0600',
			closing: '2330'
		},
		createdAt: '2025-07-06T14:01:10.989Z',
		updatedAt: '2025-07-08T14:53:37.957Z'
	};

	it('PRK-001: POST - Create Park', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/parks`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('_id');
                    
				done();
			});
	});

	it('PRK-002: GET - Get All Parks', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(parkData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/parks`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('PRK-003: GET - Get Park by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(parkData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/parks/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('PRK-004: PATCH - Update Park', (done) => {
		const updatedPayload = {
			status: 'MAINTENANCE',
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/parks/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('PRK-005: DELETE - Delete Park', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(parkData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/parks/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');
				
				done();
			});
	});

});

// Events Module
describe('🧪 EVT: Event Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		title: 'Let Zumba!',
		description: 'There is a Zumba class at the park. Come join us!',
		organizerName: 'Ehsan',
		organizerEmail: 'ios.imran@gmail.com',
		eventDate: '2025-07-15T00:00:00.000Z',
		location: 'Taman Rekreasi Sungai Tiram'
	};

	const eventData = {
		_id: '686a8a13c4383d5683602e04',
		title: 'Let\'s Zumba! 2',
		description: 'There is a Zumba class at the park. Come join us!',
		organizerName: 'Ehsan',
		organizerEmail: 'ios.imran@gmail.com',
		eventDate: '2025-07-15T16:00:00.000Z',
		location: 'Taman Rekreasi Sungai Tiram',
		createdAt: '2025-07-06T14:37:07.781Z',
		adminId: '685fbecb335bdc41ca63fa4a',
		status: 'approved'
	};

	it('EVT-001: POST - Create Event', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/events`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('_id');
                    
				done();
			});
	});

	it('EVT-002: GET - Get All Event', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(eventData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/events`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('EVT-003: GET - Get Event by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(eventData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/events/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('EVT-004: PATCH - Update Event', (done) => {
		const updatedPayload = {
			location: 'Taman Rekreasi Sungai Tiram',
			adminId: '685fbecb335bdc41ca63fa4a'
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/events/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('EVT-005: DELETE - Delete Event', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(eventData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/events/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');
				
				done();
			});
	});

});

// Shops Module
describe('🧪 SHP: Shop Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		name: 'Coffe Bean & Tea Leaf',
		description: 'Your favorite local coffee shop',
		location: 'Lot 1/1A, Jalan Sungai Tiram 1',
		openingHours: {
			opening: '900',
			closing: '2330'
		}
	};

	const shopData = {
		_id: '686a919bceb4106abf205036',
		name: 'Coffe Bean & Tea Leaf',
		description: 'Closed until further notice due to maintenance',
		status: 'maintenance',
		location: 'Lot 1/1A, Jalan Sungai Tiram 1',
		openingHours: {
			opening: '1000',
			closing: '2330'
		},
		createdAt: '2025-07-06T15:09:15.107Z',
		updatedAt: '2025-07-16T13:27:24.657Z'
	};

	it('SHP-001: POST - Create Shop', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/shops`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('_id');
                    
				done();
			});
	});

	it('SHP-002: GET - Get All Shop', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(shopData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/shops`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('SHP-003: GET - Get Shop by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(shopData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/shops/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('SHP-004: PATCH - Update Shop', (done) => {
		const updatedPayload = {
			status: 'OPEN',
			adminId: '685fbecb335bdc41ca63fa4a'
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/shops/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('SHP-005: DELETE - Delete Shop', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(shopData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/shops/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');
				
				done();
			});
	});

});

// Reports Module
describe('🧪 RPT: Report Module', () => {
	let mongoStub;
	let secMongoStub;

	const fakeId = '685fbecb335bdc41ca63fa4a';


	afterEach(() => {
		// Restore stub after each test scenario
		if (mongoStub) mongoStub.restore();
		if (secMongoStub) secMongoStub.restore();
	});

	const inputPayload = {
		email: 'ios.imran@gmail.com',
		description: 'Your favorite local coffee shop',
		location: 'Lot 1/1A, Jalan Sungai Tiram 1',
		category: 'road-disruption'
	};

	const reportData = {
		_id: '687908d135f79d4cdfa10ebc',
		email: 'ios.imran@gmail.com',
		description: 'Your favorite local coffee shop',
		location: 'Lot 1/1A, Jalan Sungai Tiram 1',
		category: 'road-disruption',
		images: null,
		status: 'approved',
		createdAt: '2025-07-17T14:29:37.006Z'
	};

	it('RPT-001: POST - Create Report', (done) => {
		mongoStub = sinon.stub(mongoFx, 'insertOne');
		mongoStub.resolves({ acknowledged: true, insertedId: fakeId });
	
		chai.request(server)
			.post(`/${ROUTE_PREPEND}/${VERSION}/reports`)
			.send(inputPayload)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');

				res.body.should.have.property('message');
				res.body.should.have.property('_id');
                    
				done();
			});
	});

	it('RPT-002: GET - Get All Report', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(reportData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/reports`)
			.end((err, res) => {
				if (err) console.log(err);
				should.exist(res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('data');
                    
				done();
			});
	});


	it('RPT-003: GET - Get Report by ID', (done) => {
		mongoStub = sinon.stub(mongoFx, 'findOne');
		mongoStub.resolves(reportData);

		chai.request(server)
			.get(`/${ROUTE_PREPEND}/${VERSION}/reports/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('data');

				done();
			});
	});

	it('RPT-004: PATCH - Update Report', (done) => {
		const updatedPayload = {
			status: 'approved',
			category: 'road-disruption'
		};

		mongoStub = sinon.stub(mongoFx, 'findOneAndUpdate');
		mongoStub.resolves(updatedPayload);

		chai.request(server)
			.patch(`/${ROUTE_PREPEND}/${VERSION}/reports/${fakeId}`)
			.send(updatedPayload)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');

				done();
			});
	});
    
	it('RPT-005: DELETE - Delete Report', (done) => {
		mongoStub = sinon.stub(mongoFx, 'find');
		mongoStub.resolves(reportData);

		secMongoStub = sinon.stub(mongoFx, 'deleteOne');
		secMongoStub.resolves({
			acknowledged: true,
			deletedCount: 1
		});

		chai.request(server)
			.delete(`/${ROUTE_PREPEND}/${VERSION}/reports/${fakeId}`)
			.end((err, res) => {
				if (err) console.log(err);
				res.should.have.status(200);
				res.body.should.have.property('message');
				res.body.should.have.property('data');
				
				done();
			});
	});

});
