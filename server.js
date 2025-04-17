const { app } = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`🚀 Neighbourhood Info Backend listening at http://localhost:${PORT}`);
});
