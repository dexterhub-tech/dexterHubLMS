const InstructorNote = require('../models/InstructorNote');
const DropRecommendation = require('../models/DropRecommendation');
const Cohort = require('../models/Cohort');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');

// Get all learners across cohorts managed by the instructor
exports.getInstructorLearners = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // 1. Find cohorts
        const query = {};
        // Relaxed filter: only restrict by instructor if not admin and actually want strict mode
        // For now, mirroring cohorts/applications page behavior to show all
        /*
        if (req.user.role === 'instructor') {
            query.instructorIds = instructorId;
        }
        */

        const cohorts = await Cohort.find(query);
        const cohortIds = cohorts.map(c => c._id);

        // 2. Find all unique learners in these cohorts with safety check
        const uniqueLearnerIds = [...new Set(cohorts.flatMap(c =>
            (c.learnerIds || []).map(id => id.toString())
        ))];

        const learners = await User.find({ _id: { $in: uniqueLearnerIds } })
            .select('firstName lastName email');

        // 3. Enhance with progress data for the specific instructor's cohorts
        const learnersWithStatus = await Promise.all(learners.map(async (learner) => {
            // Find all progress records for this learner in instructor's cohorts
            const progressRecords = await LearnerProgress.find({
                learnerId: learner._id,
                cohortId: { $in: cohortIds }
            }).sort({ lastActivityDate: -1, updatedAt: -1 });

            // Prioritize active progress over dropped
            const activeProgress = progressRecords.find(p => p.status !== 'dropped') || progressRecords[0];

            return {
                id: learner._id,
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: learner.email,
                status: activeProgress?.status || 'on-track',
                currentScore: activeProgress?.currentScore || 0,
                inactivityDays: activeProgress?.inactivityDays || 0,
                cohortId: activeProgress?.cohortId
            };
        }));

        res.json(learnersWithStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create instructor note
exports.createNote = async (req, res) => {
    try {
        const note = new InstructorNote({
            ...req.body,
            instructorId: req.user.id,
        });
        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create drop recommendation
exports.createDropRecommendation = async (req, res) => {
    try {
        const recommendation = new DropRecommendation({
            ...req.body,
            instructorId: req.user.id,
        });
        await recommendation.save();
        res.status(201).json(recommendation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
