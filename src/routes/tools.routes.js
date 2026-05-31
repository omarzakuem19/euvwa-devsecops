const express = require('express');
const tools = require('../controllers/tools.controller');

const router = express.Router();

router.get('/tools/ping', tools.ping);

module.exports = router;
