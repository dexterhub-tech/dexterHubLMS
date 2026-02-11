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

        // Auto-grade quiz submissions
        // Check if content matches quiz score pattern: "Quiz Score: X/Y"
        const quizScoreMatch = content.match(/Quiz Score: (\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/);
        if (quizScoreMatch) {
            const score = parseFloat(quizScoreMatch[1]);
            const maxScore = parseFloat(quizScoreMatch[2]);

            // Convert score to grade out of 10
            const grade = (score / maxScore) * 10;

            submission.grade = grade;
            submission.status = 'graded';
            submission.gradedAt = Date.now();

            await submission.save();

            // Update Lesson's passingLearners if score >= 5 (50% of 10)
            if (grade >= 5) {
                await Lesson.findByIdAndUpdate(lessonId, {
                    $addToSet: { 'assignment.passingLearners': learnerId }
                });
            } else {
                await Lesson.findByIdAndUpdate(lessonId, {
                    $pull: { 'assignment.passingLearners': learnerId }
                });
            }

            // Update overall learner progress and module progress
            const progress = await LearnerProgress.findOne({
                learnerId,
                cohortId
            });

            if (progress) {
                // 1. Fetch all graded submissions for this learner in this cohort
                const allSubmissions = await Submission.find({
                    learnerId,
                    cohortId,
                    status: 'graded'
                });

                if (allSubmissions.length > 0) {
                    // Calculate average score (each is out of 10)
                    const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                    const averageScoreRaw = totalScore / allSubmissions.length;

                    // Convert to Percentage (Avg Score / 10 * 100)
                    progress.currentScore = (averageScoreRaw / 10) * 100;

                    // Check for Fail/Pass Status (< 50%)
                    if (progress.currentScore < 50) {
                        progress.status = 'failed';
                    } else {
                        // Recover from failed/under-review if score improves
                        if (progress.status === 'failed' || progress.status === 'under-review' || progress.status === 'at-risk') {
                            progress.status = 'on-track';
                        }
                    }
                }

                // 2. Calculate Module Progress
                const lesson = await Lesson.findById(lessonId);
                if (lesson && lesson.moduleId) {
                    // Find or create module entry
                    let modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                    if (!modProgress) {
                        progress.moduleProgress.push({ moduleId: lesson.moduleId, scores: [], averageScore: 0, isGraduated: false });
                        modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                    }

                    // Get all submissions for lessons in THIS module
                    const moduleLessons = await Lesson.find({ moduleId: lesson.moduleId });
                    const lessonIds = moduleLessons.map(l => l._id);

                    const moduleSubmissions = await Submission.find({
                        learnerId,
                        cohortId,
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

            res.status(201).json(submission);
        } else {
            // Non-quiz submission - save as pending
            await submission.save();
            res.status(201).json(submission);
        }
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

        // Enforce max score of 10
        if (grade > 10) {
            return res.status(400).json({ error: 'Grade cannot exceed 10 marks.' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedBy = instructorId;
        submission.gradedAt = Date.now();
        await submission.save();

        // Update Lesson's passingLearners if score >= 5 (50% of 10)
        if (grade >= 5) {
            await Lesson.findByIdAndUpdate(submission.lessonId, {
                $addToSet: { 'assignment.passingLearners': submission.learnerId }
            });
        } else {
            await Lesson.findByIdAndUpdate(submission.lessonId, {
                $pull: { 'assignment.passingLearners': submission.learnerId }
            });
        }

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
                // Calculate average score (each is out of 10)
                const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                const averageScoreRaw = totalScore / allSubmissions.length;

                // Convert to Percentage (Avg Score / 10 * 100)
                progress.currentScore = (averageScoreRaw / 10) * 100;

                // Check for Fail/Pass Status (< 50%)
                if (progress.currentScore < 50) {
                    progress.status = 'failed';
                } else {
                    // Recover from failed/under-review if score improves
                    if (progress.status === 'failed' || progress.status === 'under-review' || progress.status === 'at-risk') {
                        progress.status = 'on-track';
                    }
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

// Get all submissions for a cohort (Instructor)
exports.getSubmissions = async (req, res) => {
    try {
        const { cohortId } = req.query;
        if (!cohortId) {
            return res.status(400).json({ error: 'Cohort ID is required' });
        }

        const submissions = await Submission.find({ cohortId })
            .populate('learnerId', 'firstName lastName email')
            .populate('lessonId', 'name assignment')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all submissions for instructor across all cohorts
exports.getAllSubmissionsForInstructor = async (req, res) => {
    try {
        const instructorId = req.user.id;

        // Find all cohorts where this instructor is assigned
        const Cohort = require('../models/Cohort');
        const cohorts = await Cohort.find({ instructorIds: instructorId });
        const cohortIds = cohorts.map(c => c._id);

        // Fetch all submissions for these cohorts
        const submissions = await Submission.find({ cohortId: { $in: cohortIds } })
            .populate('learnerId', 'firstName lastName email')
            .populate('lessonId', 'name assignment')
            .populate('cohortId', 'name')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

