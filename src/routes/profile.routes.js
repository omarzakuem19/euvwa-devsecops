const express = require('express');
const profile = require('../controllers/profile.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', requireAuth, profile.show);
router.post('/profile/avatar', requireAuth, profile.uploadMiddleware, profile.saveAvatar);

module.exports = router;
