const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, cohortController.getAllCohorts);
router.get('/:id', authMiddleware, cohortController.getCohortById);
router.post('/', authMiddleware, roleCheck(['instructor', 'admin', 'super-admin']), cohortController.createCohort);
router.post('/join', authMiddleware, cohortController.joinCohort);
router.get('/:cohortId/learners', authMiddleware, cohortController.getCohortLearners);

// Course Application Routes
router.get('/applications/my', authMiddleware, cohortController.getMyApplications);
router.post('/apply', authMiddleware, cohortController.applyToCourse);
router.get('/applications/pending', authMiddleware, roleCheck(['instructor', 'admin']), cohortController.listPendingApplications);
router.post('/applications/:id/action', authMiddleware, roleCheck(['instructor', 'admin']), cohortController.handleApplication);

// Cohort Course Management
router.post('/:cohortId/courses/:courseId', authMiddleware, roleCheck(['instructor', 'admin']), cohortController.addCourseToCohort);
router.delete('/:cohortId/courses/:courseId', authMiddleware, roleCheck(['instructor', 'admin']), cohortController.removeCourseFromCohort);

module.exports = router;
