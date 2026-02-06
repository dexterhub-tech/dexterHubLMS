const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, eventController.getAllEvents);
router.get('/cohort/:cohortId', authMiddleware, eventController.getEventsByCohort);
router.post('/', authMiddleware, roleCheck(['admin', 'super-admin', 'instructor']), eventController.createEvent);

module.exports = router;
