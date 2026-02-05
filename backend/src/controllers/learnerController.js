const LearnerProgress = require('../models/LearnerProgress');
const Cohort = require('../models/Cohort');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Submission = require('../models/Submission');

// Get learner progress
exports.getLearnerProgress = async (req, res) => {
    try {
        const progress = await LearnerProgress.find({ learnerId: req.params.learnerId });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update learner progress
exports.updateLearnerProgress = async (req, res) => {
    try {
        const progress = await LearnerProgress.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get learner tasks (assignments)
exports.getLearnerTasks = async (req, res) => {
    try {
        const learnerId = req.params.learnerId;

        // 1. Get Active Cohort for Learner
        const progress = await LearnerProgress.findOne({
            learnerId,
            status: { $in: ['on-track', 'at-risk', 'under-review'] }
        });

        if (!progress) {
            return res.json([]);
        }

        const cohort = await Cohort.findById(progress.cohortId);
        if (!cohort) return res.json([]);

        // 2. Get Courses -> Modules -> Lessons with Assignments
        const courses = await Course.find({ _id: { $in: cohort.courseIds } });

        let allTasks = [];

        for (const course of courses) {
            const modules = await Module.find({ _id: { $in: course.modules } });

            for (const module of modules) {
                // Find lessons that have an assignment field (not null/empty)
                const lessons = await Lesson.find({
                    _id: { $in: module.lessons },
                    "assignment.title": { $exists: true }
                });

                for (const lesson of lessons) {
                    // Check submission status
                    const submission = await Submission.findOne({
                        learnerId,
                        cohortId: cohort._id,
                        lessonId: lesson._id
                    });

                    let status = 'pending';
                    if (submission) {
                        status = submission.status === 'graded' ? 'completed' : 'submitted';
                    }

                    allTasks.push({
                        id: lesson._id,
                        title: lesson.assignment.title,
                        subject: course.name,
                        instructor: 'TBD', // Would need aggregation to find specific instructor or use cohort instructors
                        type: 'Assignment',
                        status: status,
                        dueDate: null // Could add due dates to assignments later
                    });
                }
            }
        }

        res.json(allTasks);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
