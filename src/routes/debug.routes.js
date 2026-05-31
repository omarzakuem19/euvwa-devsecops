const express = require('express');
const debug = require('../controllers/debug.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/debug', requireAuth, debug.index);
// /debug/error queda accesible sin sesión, igual que estaba antes,
// para que la demo del stack trace sea lo más sencilla posible.
router.get('/debug/error', debug.triggerError);

module.exports = router;
