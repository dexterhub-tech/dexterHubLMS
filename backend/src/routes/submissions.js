const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', authMiddleware, submissionController.submitAssignment);
router.get('/', authMiddleware, roleCheck(['instructor', 'admin']), submissionController.getSubmissions);
router.get('/all', authMiddleware, roleCheck(['instructor', 'admin']), submissionController.getAllSubmissionsForInstructor);
router.get('/my', authMiddleware, submissionController.getMySubmission);
router.post('/grade', authMiddleware, roleCheck(['instructor', 'admin']), submissionController.gradeSubmission);

module.exports = router;
