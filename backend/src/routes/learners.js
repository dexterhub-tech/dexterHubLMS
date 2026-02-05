const express = require('express');
const router = express.Router();
const learnerController = require('../controllers/learnerController');
const authMiddleware = require('../middleware/auth');

router.get('/:learnerId', authMiddleware, learnerController.getLearnerProgress);
router.get('/:learnerId/tasks', authMiddleware, learnerController.getLearnerTasks);
router.put('/:id', authMiddleware, learnerController.updateLearnerProgress);

module.exports = router;
