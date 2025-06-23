const { app } = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`🚀 JiranTetangga Backend listening at http://localhost:${PORT}`);
});
