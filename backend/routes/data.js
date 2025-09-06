const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/dataController');

router.get('/analytics', getAnalytics);

module.exports = router;
