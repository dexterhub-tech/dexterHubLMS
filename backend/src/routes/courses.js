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
router.put('/:id', authMiddleware, roleCheck(['instructor', 'admin']), courseController.updateCourse);

router.post('/modules', authMiddleware, roleCheck(['instructor', 'admin']), courseController.createModule);
router.put('/modules/:id', authMiddleware, roleCheck(['instructor', 'admin']), courseController.updateModule);

router.post('/lessons', authMiddleware, roleCheck(['instructor', 'admin']), courseController.createLesson);
router.put('/lessons/:id', authMiddleware, roleCheck(['instructor', 'admin']), courseController.updateLesson);

module.exports = router;
