const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, profileController.getProfile);
router.put('/me', authMiddleware, profileController.updateProfile);

module.exports = router;
