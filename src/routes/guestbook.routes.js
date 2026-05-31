const express = require('express');
const guestbook = require('../controllers/guestbook.controller');

const router = express.Router();

router.get('/guestbook', guestbook.list);
router.post('/guestbook', guestbook.create);

module.exports = router;
