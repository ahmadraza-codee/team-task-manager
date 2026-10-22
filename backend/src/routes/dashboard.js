
const express = require('express');
const c = require('../controllers/dashboardController');
const router = express.Router();
router.get('/', c.dashboard);
module.exports = router;
