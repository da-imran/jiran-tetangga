# Code Guidelines and Rules

## Table of Contents
1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [Module Structure](#module-structure)
4. [API Endpoint Patterns](#api-endpoint-patterns)
5. [Error Handling](#error-handling)
6. [Logging Standards](#logging-standards)
7. [Database Operations](#database-operations)
8. [Validation](#validation)
9. [Security](#security)
10. [Testing](#testing)
11. [Documentation](#documentation)

---

## Project Structure

### Directory Organization
```
project-root/
├── middleware/          # Middleware functions (auth, API checks)
├── modules/            # API route handlers (one file per resource)
├── utilities/          # Shared utilities (mongodb, logger, validation, etc.)
├── swagger/            # API documentation configuration
├── test/              # Test files and test server setup
└── nginx/             # Nginx configuration
```

### File Naming
- Use **camelCase** for JavaScript files: `adminUsers.js`, `apiCheck.js`
- Use **kebab-case** for configuration files: `swagger-base.js`, `swagger-output.json`
- Prefix test files with purpose: `test.js`, `testServer.js`, `testIndex.js`

---

## Naming Conventions

### Variables and Constants
```javascript
// Constants - SCREAMING_SNAKE_CASE
const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
const API_KEY = secrets.API_KEY?.value;
const MODULE = MODULES.ADMINISTRATOR;

// Variables - camelCase
const apiName = 'Get All Reports API';
const mongoClient = await mongodb.clientConnect(mongoUri);
const updateObj = {};

// Environment variables - SCREAMING_SNAKE_CASE
const SERVICE_NAME = process.env.SERVICE_NAME;
const VERSION = process.env.VERSION;
```

### Functions
```javascript
// Functions - camelCase with descriptive names
const requiredCheck = (input, requiredFields, res, config) => { ... };
const getSecrets = async (secretsObj) => { ... };
const signToken = (payload) => { ... };
```

### API Names
```javascript
// Pattern: Action + Resource + "API"
const apiName = 'Get All Admin Users API';
const apiName = 'Create Disruption API';
const apiName = 'Update Parks API';
const apiName = 'Delete Event by eventId API';
```

---

## Module Structure

### Standard Module Template
Each module file must follow this structure:

```javascript
const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');
const { logger, LOG_LEVELS } = require('../utilities/logger');
const { MODULES, METHODS } = require('../utilities/constants');
const { v4: uuidv4 } = require('uuid');

module.exports = (app, config) => {
    const { mongoClient } = config;
    const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
    const VERSION = process.env.VERSION;
    const SERVICE_NAME = process.env.SERVICE_NAME;
    const MODULE = MODULES.RESOURCE_NAME;

    // GET all resources
    app.get(`/${ROUTE_PREPEND}/${VERSION}/resources`, async (req, res) => { ... });

    // GET resource by ID
    app.get(`/${ROUTE_PREPEND}/${VERSION}/resources/:resourceId`, async (req, res) => { ... });

    // POST create resource
    app.post(`/${ROUTE_PREPEND}/${VERSION}/resources`, async (req, res) => { ... });

    // PATCH update resource
    app.patch(`/${ROUTE_PREPEND}/${VERSION}/resources/:resourceId`, async (req, res) => { ... });

    // DELETE resource
    app.delete(`/${ROUTE_PREPEND}/${VERSION}/resources/:resourceId`, async (req, res) => { ... });
};
```

### Required Imports
Every module must import:
- `mongodb` utility for database operations
- `validation` utility for input validation
- `logger` and `LOG_LEVELS` for logging
- `constants` for MODULES and METHODS
- `uuid` for generating trace IDs

---

## API Endpoint Patterns

### Route Structure
```javascript
// Pattern: /{ROUTE_PREPEND}/{VERSION}/{resource}
app.get(`/${ROUTE_PREPEND}/${VERSION}/adminUsers`, ...);
app.post(`/${ROUTE_PREPEND}/${VERSION}/reports`, ...);

// Pattern with ID: /{ROUTE_PREPEND}/{VERSION}/{resource}/:resourceId
app.get(`/${ROUTE_PREPEND}/${VERSION}/events/:eventId`, ...);
app.patch(`/${ROUTE_PREPEND}/${VERSION}/shops/:shopId`, ...);
```

### Swagger Documentation Tags
Every endpoint must include Swagger comments:
```javascript
app.get(`/${ROUTE_PREPEND}/${VERSION}/resources`, async (req, res) => {
    // #swagger.tags = ['resources']
    // #swagger.summary = 'Get all resources'
    // #swagger.description = 'Retrieve all resources with pagination and search support'
    ...
});
```

### Standard Endpoint Flow
1. **Initialize variables** (traceId, apiName)
2. **Log API call start**
3. **Validate inputs** (pagination, required fields)
4. **Execute database operation**
5. **Handle success/error responses**
6. **Log result**

```javascript
app.get(`/${ROUTE_PREPEND}/${VERSION}/resources/:resourceId`, async (req, res) => {
    const traceId = uuidv4();
    const apiName = 'Get Resource API';
    const { resourceId } = req.params;

    console.log(`${apiName} is called at ${new Date()}`);
    logger.log({
        service: SERVICE_NAME,
        module: MODULE,
        apiName,
        method: METHODS.GET,
        status: 200,
        message: `${apiName} is called at ${new Date()}`,
        traceId,
        level: LOG_LEVELS.INFO,
    });

    try {
        const requiredFields = ['resourceId'];
        const config = { traceId, MODULE, apiName };
        
        if (!requiredCheck(req.params, requiredFields, res, config)) {
            return;
        }

        const result = await mongo.findOne(mongoClient, 'resources', 
            { _id: mongo.getObjectId(resourceId) }
        );

        if (result) {
            res.status(200).send({ status: 200, data: result });
            logger.log({
                service: SERVICE_NAME,
                module: MODULE,
                apiName,
                status: 200,
                message: 'Response Success',
                data: result,
                traceId,
                level: LOG_LEVELS.INFO,
            });
        } else {
            res.status(404).send({ status: 404, message: 'Resource not found' });
            logger.log({
                service: SERVICE_NAME,
                module: MODULE,
                apiName,
                status: 404,
                message: 'Resource not found',
                traceId,
                level: LOG_LEVELS.ERROR,
            });
        }
    } catch (err) {
        const error = { message: err.message, stack: err.stack };
        res.status(500).send({ status: 500, message: `${apiName} error`, error });
        logger.log({
            service: SERVICE_NAME,
            module: MODULE,
            apiName,
            status: 500,
            message: error,
            traceId,
            level: LOG_LEVELS.ERROR,
        });
    }
});
```

---

## Error Handling

### Console Logging Patterns
```javascript
// Success
console.log(`${apiName} Response Success.`);
console.log(`${apiName} MongoDB Success.`);

// Warnings
console.warn('⚠️ Invalid or missing API key');
console.warn(`⚠️ Missing secret: ${key}`);

// Errors
console.error(`❌ ${apiName} failed to fetch the admin user. Admin User not found.`);
console.error(`❌ ${apiName} Error creating shop.`);
console.error(`❌ ${apiName} Bad Request: Invalid page number`);
```

### HTTP Status Codes
- **200**: Successful operation
- **400**: Bad request (validation errors, invalid parameters)
- **401**: Unauthorized (invalid/missing API key or credentials)
- **404**: Resource not found
- **500**: Internal server error

### Error Response Format
```javascript
// Standard error response
res.status(400).send({
    status: 400,
    message: 'Bad Request: Invalid page number',
});

// Error with details
res.status(500).send({
    status: 500,
    message: `${apiName} error`,
    error: { message: err.message, stack: err.stack },
});
```

### Try-Catch Pattern
```javascript
try {
    // Main logic
} catch (err) {
    const error = { message: err.message, stack: err.stack };
    res.status(500).send({
        status: 500,
        message: `${apiName} error`,
        error,
    });
    logger.log({
        service: SERVICE_NAME,
        module: MODULE,
        apiName,
        status: 500,
        message: error,
        traceId,
        level: LOG_LEVELS.ERROR,
    });
}
```

---

## Logging Standards

### Log Levels
Use the defined log levels from `LOG_LEVELS`:
```javascript
const LOG_LEVELS = {
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'debug',
};
```

### Logging Pattern
```javascript
logger.log({
    service: SERVICE_NAME,           // Required
    module: MODULE,                  // Required
    apiName,                        // Required
    method: METHODS.GET,            // Optional (for API calls)
    status: 200,                    // Required
    message: 'Response Success',    // Required
    data: result,                   // Optional (include for success)
    traceId,                        // Required
    level: LOG_LEVELS.INFO,         // Required
});
```

### When to Log
1. **API call start** - INFO level
2. **Successful operations** - INFO level
3. **Not found responses** - ERROR level
4. **Validation failures** - ERROR level
5. **Server errors** - ERROR level
6. **Critical failures** - CRITICAL level

---

## Database Operations

### MongoDB Connection
```javascript
// Never instantiate connection in modules
// Always receive mongoClient from config
const { mongoClient } = config;
```

### Common Operations

#### Find One
```javascript
const result = await mongo.findOne(
    mongoClient, 
    'collection_name', 
    { _id: mongo.getObjectId(id) },
    { projection: { field1: 1, field2: 1 } }  // Optional
);
```

#### Insert One
```javascript
const inputResult = await mongo.insertOne(
    mongoClient, 
    'collection_name', 
    { field1: value1, field2: value2, createdAt: new Date() }
);
```

#### Update One
```javascript
const updateResult = await mongo.findOneAndUpdate(
    mongoClient, 
    'collection_name', 
    { _id: mongo.getObjectId(id) },
    { field1: newValue1, updatedAt: new Date() }
);
```

#### Delete One
```javascript
const deleteResult = await mongo.deleteOne(
    mongoClient, 
    'collection_name', 
    { _id: mongo.getObjectId(id) }
);
```

#### Aggregation
```javascript
const aggregation = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNumber - 1) * dataPerPage },
    { $limit: +dataPerPage },
    { $project: { field1: 1, field2: 1 } }
];

const result = await mongo.aggregate(mongoClient, 'collection_name', aggregation);
```

### Pagination Pattern
```javascript
const {
    pageNumber = 1,
    dataPerPage = 20,
    search,
    filters,
} = req.query;

// Validate pagination parameters
if (!Number.isInteger(+pageNumber) || +pageNumber <= 0) {
    return res.status(400).send({
        status: 400,
        message: 'Bad Request: Invalid page number',
    });
}

if (!Number.isInteger(+dataPerPage) || +dataPerPage <= 0 || +dataPerPage > 100) {
    return res.status(400).send({
        status: 400,
        message: 'Bad Request: Invalid number of data per page',
    });
}
```

### Search Pattern
```javascript
const matchStage = {};

// Text search
if (search && search.trim() !== '') {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    matchStage.name = { $regex: safeSearch, $options: 'i' };
}

// Filter by status
if (typeof filters === 'string' && filters.trim() !== '') {
    const filterArray = filters.split(',').map(f => f.trim());
    matchStage.status = { $in: filterArray };
}
```

### Count with Aggregation
```javascript
const countPipeline = [{ $match: matchStage }, { $count: 'total' }];
const [countResult, dataResult] = await Promise.all([
    mongo.aggregate(mongoClient, 'collection', countPipeline),
    mongo.aggregate(mongoClient, 'collection', aggregation)
]);

const totalCount = (countResult && countResult[0] && countResult[0].total) 
    ? countResult[0].total 
    : 0;
```

---

## Validation

### Required Fields Check
```javascript
const requiredFields = ['field1', 'field2', 'field3'];
const config = { traceId, MODULE, apiName };

if (!requiredCheck(req.body, requiredFields, res, config)) {
    return;  // Response already sent by requiredCheck
}
```

### ObjectId Validation
ObjectId validation is **automatically handled** by `requiredCheck` for fields ending with 'id' or 'Id'.

### Custom Validation Examples
```javascript
// Email validation (if needed beyond required check)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).send({
        status: 400,
        message: 'Bad request: Invalid email format',
    });
}

// Duplicate check
const existingUser = await mongo.findOne(mongoClient, 'admin_user', { email });
if (existingUser) {
    return res.status(400).send({
        status: 400,
        message: 'Bad request: duplicate admin email exists.',
    });
}
```

### Update Object Pattern
```javascript
const updateObj = {};

// Only add fields that are provided
if (field1) updateObj.field1 = field1;
if (field2) updateObj.field2 = field2;
if (status) updateObj.status = status;

// Always add updatedAt for updates
updateObj.updatedAt = new Date();
```

### Nested Object Updates
```javascript
if (openingHours) {
    if (!updateObj.openingHours) {
        updateObj.openingHours = {};
    }
    if (openingHours.opening) {
        updateObj.openingHours.opening = openingHours.opening;
    }
    if (openingHours.closing) {
        updateObj.openingHours.closing = openingHours.closing;
    }
}
```

---

## Security

### API Key Authentication
```javascript
// middleware/apiCheck.js pattern
const clientApiKey = req.headers['x-api-key'];
const API_KEY = secrets.API_KEY?.value;

if (!clientApiKey || clientApiKey !== API_KEY) {
    console.warn('⚠️ Invalid or missing API key');
    return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
}
```

### Password Encryption
```javascript
const CryptoJS = require('crypto-js');
const ENCRYPTION_KEY = secrets.ENCRYPTION_KEY.value;

// Encrypt password
const encryptPassword = CryptoJS.AES.encrypt(
    password, 
    ENCRYPTION_KEY, 
    { mode: CryptoJS.mode.ECB }
).toString();

// Decrypt password
const decryptedPassword = CryptoJS.AES.decrypt(
    user.password, 
    ENCRYPTION_KEY,
    { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
).toString(CryptoJS.enc.Utf8);
```

### JWT Token Management
```javascript
// Sign token
const token = signToken({ 
    id: mongo.getObjectId(user._id), 
    email: user.email 
});

// Token expiry: 15 minutes (configured in jwt.js)
```

### Secret Management
- **Never** hardcode secrets in code
- Use Infisical SDK for secret management
- Validate all secrets on startup with `checkSecretObjectNull()`
- Exit application if critical secrets are missing

```javascript
const secretsLoaded = await checkSecretObjectNull();
if (!secretsLoaded) {
    console.error('❌ Critical secrets could not be loaded from Infisical. Exiting...');
    process.exit(1);
}
```

### Input Sanitization
```javascript
// Sanitize search input for regex
const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

---

## Testing

### Test File Structure
```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const mongoFx = require('../utilities/mongodb');

const should = chai.should();
chai.use(chaiHttp);

describe('🧪 MODULE_CODE: Module Name', () => {
    let mongoStub;
    let secMongoStub;
    const fakeId = '685fbecb335bdc41ca63fa4a';

    afterEach(() => {
        if (mongoStub) mongoStub.restore();
        if (secMongoStub) secMongoStub.restore();
    });

    // Test cases...
});
```

### Test Case Naming
```javascript
// Pattern: CODE-NUMBER: METHOD - Action Description
it('ADM-001: POST - Create Admin User', (done) => { ... });
it('DSP-002: GET - Get All Disruptions', (done) => { ... });
it('PRK-003: GET - Get Park by ID', (done) => { ... });
it('EVT-004: PATCH - Update Event', (done) => { ... });
it('SHP-005: DELETE - Delete Shop', (done) => { ... });
```

### Module Codes
- **ADM**: Admin Module
- **DSP**: Disruption Module
- **PRK**: Park Module
- **EVT**: Event Module
- **SHP**: Shop Module
- **RPT**: Report Module

### Test Coverage Requirements
Each module must have tests for:
1. **POST** - Create resource
2. **GET** - Get all resources
3. **GET** - Get resource by ID
4. **PATCH** - Update resource
5. **DELETE** - Delete resource

### Stubbing Pattern
```javascript
// Stub database operation
mongoStub = sinon.stub(mongoFx, 'insertOne');
mongoStub.resolves({ acknowledged: true, insertedId: fakeId });

// Stub for operations requiring multiple stubs
mongoStub = sinon.stub(mongoFx, 'find');
mongoStub.resolves(resourceData);

secMongoStub = sinon.stub(mongoFx, 'deleteOne');
secMongoStub.resolves({ acknowledged: true, deletedCount: 1 });
```

### Assertion Pattern
```javascript
chai.request(server)
    .get(`/${ROUTE_PREPEND}/${VERSION}/resources`)
    .end((err, res) => {
        if (err) console.log(err);
        should.exist(res.body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('data');
        done();
    });
```

---

## Documentation

### Swagger Configuration
- All endpoints must have Swagger tags
- Use `swagger-base.js` for configuration
- Run `swagger.js` to generate `swagger-output.json`

### Code Comments

#### Required Comments
```javascript
// 🔎 Check for duplicate email
// 🔐 Encrypt password
// 🔎 Proceed to create resource
```

#### Emoji Usage Guidelines
- 🔎 - Check/Search operation
- 🔐 - Security/Encryption operation
- ✅ - Success operation
- ❌ - Error/Failure
- ⚠️ - Warning

### API Response Documentation
```javascript
// Success response
{
    status: 200,
    data: { ... },
    total: 100  // For paginated lists
}

// Error response
{
    status: 400,
    message: 'Error description'
}

// Create/Update success
{
    message: 'Resource created successfully',
    _id: 'objectId'
}
```

### Environment Variables Documentation
Document all required environment variables:
```javascript
// Required
ROUTE_PREPEND          // API route prefix (e.g., 'jiran-tetangga')
VERSION                // API version (e.g., 'v1')
SERVICE_NAME           // Service identifier
NODE_ENV               // Environment (local/dev/prod)
MONGO_DB_NAME          // MongoDB database name

// Infisical
INFISICAL_URI          // Infisical server URL
INFISICAL_ENV          // Infisical environment
INFISICAL_PROJECT_ID   // Project ID
INFISICAL_CLIENT_ID    // Client ID
INFISICAL_CLIENT_SECRET // Client secret

// Optional
HOSTNAME               // Server hostname (default: localhost)
PORT                   // Server port (default: 3500)
```

---

## Best Practices Summary

### DO's ✅
- Always generate unique `traceId` using `uuidv4()`
- Log every API call start and result
- Validate all inputs using `requiredCheck`
- Use try-catch for all async operations
- Return early after sending error responses
- Add `createdAt` for new records
- Add `updatedAt` for updates
- Use `mongo.getObjectId()` for ObjectId conversion
- Sanitize user inputs (especially for regex searches)
- Check for duplicates before creating records
- Use descriptive variable names
- Include Swagger documentation tags
- Use consistent HTTP status codes
- Handle null/undefined values gracefully
- Use `Promise.all` for parallel operations

### DON'Ts ❌
- Don't hardcode secrets or credentials
- Don't create MongoDB connections in modules
- Don't skip validation for "trusted" inputs
- Don't log sensitive data (passwords, tokens)
- Don't use `console.log` without emoji prefixes in production
- Don't send multiple responses in one request handler
- Don't ignore error handling in catch blocks
- Don't use `var` (use `const` or `let`)
- Don't mutate request parameters directly
- Don't skip logging for critical operations
- Don't return after validation without checking result
- Don't use synchronous operations where async is available
- Don't skip status codes in responses

---

## Code Review Checklist

Before submitting code, ensure:

- [ ] Module follows the standard template structure
- [ ] All endpoints have Swagger documentation
- [ ] Trace IDs are generated and logged
- [ ] Input validation is implemented
- [ ] Error handling covers all paths
- [ ] Success and error responses follow standards
- [ ] Console logs use appropriate emojis
- [ ] Database operations use provided utilities
- [ ] No hardcoded secrets or credentials
- [ ] Tests are written for all endpoints
- [ ] Environment variables are documented
- [ ] API naming follows conventions
- [ ] HTTP status codes are correct
- [ ] Logging includes all required fields
- [ ] Pagination is implemented correctly (where applicable)
- [ ] Search functionality is sanitized
- [ ] ObjectIds are validated
- [ ] Timestamps (createdAt/updatedAt) are included
- [ ] Response format is consistent

---

## Quick Reference

### Standard Imports
```javascript
const mongo = require('../utilities/mongodb');
const { requiredCheck } = require('../utilities/validation');
const { logger, LOG_LEVELS } = require('../utilities/logger');
const { MODULES, METHODS } = require('../utilities/constants');
const { v4: uuidv4 } = require('uuid');
```

### Standard Variables
```javascript
const traceId = uuidv4();
const { mongoClient } = config;
const ROUTE_PREPEND = process.env.ROUTE_PREPEND;
const VERSION = process.env.VERSION;
const SERVICE_NAME = process.env.SERVICE_NAME;
const MODULE = MODULES.RESOURCE_NAME;
const apiName = 'Action Resource API';
```

### Standard Validation
```javascript
const requiredFields = ['field1', 'field2'];
const config = { traceId, MODULE, apiName };
if (!requiredCheck(req.body, requiredFields, res, config)) return;
```

### Standard Error Response
```javascript
catch (err) {
    const error = { message: err.message, stack: err.stack };
    res.status(500).send({
        status: 500,
        message: `${apiName} error`,
        error,
    });
    logger.log({
        service: SERVICE_NAME,
        module: MODULE,
        apiName,
        status: 500,
        message: error,
        traceId,
        level: LOG_LEVELS.ERROR,
    });
}
```

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Maintained By**: Muhammad Ehsan Imran