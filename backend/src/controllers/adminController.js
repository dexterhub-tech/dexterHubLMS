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
// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Transfer learner to a new course and/or cohort
exports.transferLearner = async (req, res) => {
    try {
        const { learnerId, fromCohortId, fromCourseId, toCohortId, toCourseId } = req.body;

        if (!learnerId || !fromCohortId || !fromCourseId || !toCohortId || !toCourseId) {
            return res.status(400).json({ error: 'All fields (learnerId, fromCohortId, fromCourseId, toCohortId, toCourseId) are required' });
        }

        const Cohort = require('../models/Cohort');
        const Course = require('../models/Course');

        // Check if student exists
        const learner = await User.findById(learnerId);
        if (!learner) {
            return res.status(404).json({ error: 'Learner not found' });
        }

        // Check if source and target cohorts/courses exist
        const fromCohort = await Cohort.findById(fromCohortId);
        const toCohort = await Cohort.findById(toCohortId);
        if (!fromCohort || !toCohort) {
            return res.status(404).json({ error: 'One or both cohorts not found' });
        }

        const fromCourse = await Course.findById(fromCourseId);
        const toCourse = await Course.findById(toCourseId);
        if (!fromCourse || !toCourse) {
            return res.status(404).json({ error: 'One or both courses not found' });
        }

        // Check if destination course is actually in target cohort
        if (!toCohort.courseIds.includes(toCourseId)) {
            return res.status(400).json({ error: 'Target course is not assigned to the target cohort' });
        }

        // 1. Process previous progress (Mark it as dropped)
        await LearnerProgress.updateMany(
            { learnerId, cohortId: fromCohortId, courseId: fromCourseId, status: { $ne: 'dropped' } },
            { $set: { status: 'dropped' } }
        );

        // 2. Remove learner from fromCourse registrars
        await Course.findByIdAndUpdate(fromCourseId, {
            $pull: { registrars: learnerId }
        });

        // 3. Add learner to toCourse registrars
        await Course.findByIdAndUpdate(toCourseId, {
            $addToSet: { registrars: learnerId }
        });

        // 4. Update Cohort learner lists
        if (fromCohortId.toString() !== toCohortId.toString()) {
            // Remove from old cohort learnerIds
            await Cohort.findByIdAndUpdate(fromCohortId, {
                $pull: { learnerIds: learnerId }
            });
        }

        // Add to new cohort learnerIds
        await Cohort.findByIdAndUpdate(toCohortId, {
            $addToSet: { learnerIds: learnerId }
        });

        // 5. Check if progress record already exists for destination
        let toProgress = await LearnerProgress.findOne({ learnerId, cohortId: toCohortId, courseId: toCourseId });
        if (toProgress) {
            toProgress.status = 'on-track';
            toProgress.updatedAt = new Date();
            await toProgress.save();
        } else {
            // Create fresh progress record
            toProgress = new LearnerProgress({
                learnerId,
                cohortId: toCohortId,
                courseId: toCourseId,
                status: 'on-track',
                currentScore: 0,
                learningHoursThisWeek: 0
            });
            await toProgress.save();
        }

        // 6. Update user's active cohort
        await User.findByIdAndUpdate(learnerId, { activeCohortId: toCohortId });

        // 7. Write to AuditLog
        const auditLog = new AuditLog({
            actor: req.user.id,
            action: 'transfer_learner',
            targetUser: learnerId,
            targetCohort: toCohortId,
            details: {
                fromCohortId,
                fromCourseId,
                toCohortId,
                toCourseId,
                fromCohortName: fromCohort.name,
                toCohortName: toCohort.name,
                fromCourseName: fromCourse.name,
                toCourseName: toCourse.name
            }
        });
        await auditLog.save();

        res.json({
            message: 'Learner transferred successfully',
            progress: toProgress
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
