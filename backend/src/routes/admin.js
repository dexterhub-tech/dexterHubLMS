const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Appeal = require('../models/Appeal');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Drop recommendations
router.get('/drop-recommendations', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.getDropRecommendations);
router.put('/drop-recommendations/:id', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.reviewDropRecommendation);

// Grace periods
router.post('/grace-periods', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.grantGracePeriod);

// Appeals
router.get('/appeals', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.getAppeals);
router.put('/appeals/:id', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.reviewAppeal);
router.post('/appeals', authMiddleware, roleCheck(['learner']), async (req, res) => {
    try {
        const appeal = new Appeal({
            ...req.body,
            learnerId: req.user.id,
        });
        await appeal.save();
        res.status(201).json(appeal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Audit logs
router.get('/audit-logs', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.getAuditLogs);

// User management
router.get('/users', authMiddleware, roleCheck(['admin', 'super-admin']), adminController.getAllUsers);

module.exports = router;
