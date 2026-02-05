const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public/Learner routes
router.get('/', authMiddleware, courseController.getAllCourses);
router.get('/:id', authMiddleware, courseController.getCourseDetails);

// Instructor/Admin routes
router.post('/', authMiddleware, roleCheck(['instructor', 'admin']), courseController.createCourse);
router.post('/modules', authMiddleware, roleCheck(['instructor', 'admin']), courseController.createModule);
router.post('/lessons', authMiddleware, roleCheck(['instructor', 'admin']), courseController.createLesson);

module.exports = router;
