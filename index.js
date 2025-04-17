module.exports = async (app, config) => {
	require('./modules/adminUser')(app, config);
	require('./modules/reports')(app, config);
	require('./modules/residents')(app, config);
	require('./modules/updates')(app, config);
	require('./modules/events')(app, config);
	require('./modules/shops')(app, config);
	require('./modules/parks')(app, config);
};
