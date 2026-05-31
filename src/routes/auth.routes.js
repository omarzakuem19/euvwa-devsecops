const express = require('express');
const auth = require('../controllers/auth.controller');

const router = express.Router();

router.get('/login', auth.showLogin);
router.post('/login', auth.loginLimiter, auth.login);
router.get('/logout', auth.logout);

module.exports = router;
