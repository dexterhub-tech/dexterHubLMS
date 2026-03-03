const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/generate-quiz', authMiddleware, roleCheck(['instructor', 'admin']), aiController.generateQuiz);

module.exports = router;
