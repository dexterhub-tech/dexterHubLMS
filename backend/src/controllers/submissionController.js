const Submission = require('../models/Submission');
const LearnerProgress = require('../models/LearnerProgress');
const Lesson = require('../models/Lesson');

// Submit an assignment
exports.submitAssignment = async (req, res) => {
    try {
        const { lessonId, cohortId, content } = req.body;
        const learnerId = req.user.id;

        // Check if submission already exists
        let submission = await Submission.findOne({ learnerId, lessonId, cohortId });

        if (submission) {
            submission.content = content;
            submission.submittedAt = Date.now();
            submission.status = 'pending'; // Reset status if resubmitting
        } else {
            submission = new Submission({
                learnerId,
                cohortId,
                lessonId,
                content
            });
        }

        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my submission for a lesson
exports.getMySubmission = async (req, res) => {
    try {
        const { lessonId, cohortId } = req.query;
        const learnerId = req.user.id;

        const submission = await Submission.findOne({ learnerId, lessonId, cohortId });
        res.json(submission || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Grade a submission (Instructor only)
exports.gradeSubmission = async (req, res) => {
    try {
        const { submissionId, grade, feedback } = req.body;
        const instructorId = req.user.id;

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedBy = instructorId;
        submission.gradedAt = Date.now();
        await submission.save();

        // Update overall learner progress and module progress
        const progress = await LearnerProgress.findOne({
            learnerId: submission.learnerId,
            cohortId: submission.cohortId
        });

        if (progress) {
            // 1. Fetch all graded submissions for this learner in this cohort
            const allSubmissions = await Submission.find({
                learnerId: submission.learnerId,
                cohortId: submission.cohortId,
                status: 'graded'
            });

            if (allSubmissions.length > 0) {
                const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                progress.currentScore = totalScore / allSubmissions.length;

                // Check for Review Status (< 50%)
                if (progress.currentScore < 50) {
                    progress.status = 'under-review';
                } else if (progress.status === 'under-review') {
                    progress.status = 'on-track';
                }
            }

            // 2. Calculate Module Progress
            const lesson = await Lesson.findById(submission.lessonId);
            if (lesson && lesson.moduleId) { // Ensure lesson is linked to a module (Class)
                // Find or create module entry
                let modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                if (!modProgress) {
                    progress.moduleProgress.push({ moduleId: lesson.moduleId, scores: [], averageScore: 0, isGraduated: false });
                    modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                }

                // Get all submissions for lessons in THIS module
                // We need to find all lessons in this module first
                const moduleLessons = await Lesson.find({ moduleId: lesson.moduleId });
                const lessonIds = moduleLessons.map(l => l._id);

                const moduleSubmissions = await Submission.find({
                    learnerId: submission.learnerId,
                    cohortId: submission.cohortId,
                    lessonId: { $in: lessonIds },
                    status: 'graded'
                });

                if (moduleSubmissions.length > 0) {
                    const modTotal = moduleSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                    modProgress.averageScore = modTotal / moduleSubmissions.length;
                    modProgress.scores = moduleSubmissions.map(s => s.grade);

                    // Graduation Check (70%)
                    modProgress.isGraduated = modProgress.averageScore >= 70;
                }
            }

            await progress.save();
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
