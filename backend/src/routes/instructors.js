const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/notes', authMiddleware, roleCheck(['instructor', 'admin']), instructorController.createNote);
router.post('/drop-recommendations', authMiddleware, roleCheck(['instructor']), instructorController.createDropRecommendation);
router.get('/learners', authMiddleware, roleCheck(['instructor', 'admin', 'super-admin']), instructorController.getInstructorLearners);
router.get('/dashboard-stats', authMiddleware, roleCheck(['instructor']), instructorController.getDashboardStats);

module.exports = router;
