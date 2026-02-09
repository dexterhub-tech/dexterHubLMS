const InstructorNote = require('../models/InstructorNote');
const DropRecommendation = require('../models/DropRecommendation');
const Cohort = require('../models/Cohort');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');

// Get all learners across cohorts managed by the instructor
exports.getInstructorLearners = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // 1. Find cohorts managed by this instructor
        const cohorts = await Cohort.find({ instructorIds: instructorId });
        const cohortIds = cohorts.map(c => c._id);

        // 2. Find all unique learners in these cohorts
        const uniqueLearnerIds = [...new Set(cohorts.flatMap(c => c.learnerIds.map(id => id.toString())))];

        const learners = await User.find({ _id: { $in: uniqueLearnerIds } })
            .select('firstName lastName email');

        // 3. Enhance with progress data for the specific instructor's cohorts
        const learnersWithStatus = await Promise.all(learners.map(async (learner) => {
            // Find the most relevant progress record (e.g., active in one of this instructor's cohorts)
            const progress = await LearnerProgress.findOne({
                learnerId: learner._id,
                cohortId: { $in: cohortIds }
            }).sort({ lastActivityDate: -1 });

            return {
                id: learner._id,
                firstName: learner.firstName,
                lastName: learner.lastName,
                email: learner.email,
                status: progress?.status || 'on-track',
                currentScore: progress?.currentScore || 0,
                inactivityDays: progress?.inactivityDays || 0,
                cohortId: progress?.cohortId
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
