
const express = require('express');
const { registerValidators, loginValidators, handleValidation } = require('../validators');
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/authController');
const router = express.Router();
router.post('/register', registerValidators, handleValidation, c.register);
router.post('/login', loginValidators, handleValidation, c.login);
router.post('/logout', requireAuth, c.logout);
router.get('/me', requireAuth, c.me);
module.exports = router;
