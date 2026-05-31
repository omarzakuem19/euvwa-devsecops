const express = require('express');
const debug = require('../controllers/debug.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/debug', requireAuth, requireAdmin, debug.index);
router.get('/debug/error', debug.triggerError);

module.exports = router;
