const express = require('express');
const users = require('../controllers/users.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/users/:id', requireAuth, users.show);

module.exports = router;
