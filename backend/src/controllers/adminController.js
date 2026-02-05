const DropRecommendation = require('../models/DropRecommendation');
const Appeal = require('../models/Appeal');
const GracePeriod = require('../models/GracePeriod');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');

// Get pending drop recommendations
exports.getDropRecommendations = async (req, res) => {
    try {
        const recommendations = await DropRecommendation.find({ status: 'pending' })
            .populate('learnerId')
            .populate('instructorId');
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Review drop recommendation
exports.reviewDropRecommendation = async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;
        const recommendation = await DropRecommendation.findByIdAndUpdate(
            req.params.id,
            {
                status,
                reviewNotes,
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
            },
            { new: true }
        );

        // If approved, update learner status
        if (status === 'approved') {
            await User.findByIdAndUpdate(recommendation.learnerId, { status: 'dropped' });
            await LearnerProgress.updateOne(
                { learnerId: recommendation.learnerId, cohortId: recommendation.cohortId },
                { status: 'dropped' }
            );
        }

        res.json(recommendation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Grant grace period
exports.grantGracePeriod = async (req, res) => {
    try {
        const { learnerId, cohortId, extensionDays, reason } = req.body;

        const gracePeriod = new GracePeriod({
            learnerId,
            cohortId,
            grantedBy: req.user.id,
            extensionDays,
            reason,
            originalDeadline: new Date(),
            newDeadline: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000),
            expiresAt: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000),
        });

        await gracePeriod.save();
        res.status(201).json(gracePeriod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get pending appeals
exports.getAppeals = async (req, res) => {
    try {
        const appeals = await Appeal.find({ status: 'pending' })
            .populate('learnerId')
            .populate('dropRecommendationId');
        res.json(appeals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Review appeal
exports.reviewAppeal = async (req, res) => {
    try {
        const { status, reviewNotes } = req.body;
        const appeal = await Appeal.findByIdAndUpdate(
            req.params.id,
            {
                status,
                reviewNotes,
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
            },
            { new: true }
        );

        // If appeal approved, reverse the drop
        if (status === 'approved') {
            await User.findByIdAndUpdate(appeal.learnerId, { status: 'active' });
            await LearnerProgress.updateOne(
                { learnerId: appeal.learnerId },
                { status: 'on-track' }
            );
        }

        res.json(appeal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
