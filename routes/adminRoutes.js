const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.json({ message: 'Admin Home' });
});

router.post('/create', (req, res) => {
	res.json({ message: 'Admin Created' });
});

module.exports = router;
