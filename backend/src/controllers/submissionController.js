const Submission = require('../models/Submission');
const LearnerProgress = require('../models/LearnerProgress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Module = require('../models/Module');

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

        // Always save the submission
        await submission.save();

        const quizScoreMatch = content.match(/Quiz Score: (\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/);
        if (quizScoreMatch) {
            const score = parseFloat(quizScoreMatch[1]);
            const maxScore = parseFloat(quizScoreMatch[2]);
            const grade = (score / maxScore) * 10;

            submission.grade = grade;
            submission.status = 'graded';
            submission.gradedAt = Date.now();

            await submission.save(); // Save again with grade info

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
                    // 1. Calculate Total Assignments in Course for accurate grading
                    let totalAssignmentsInCourse = 0;
                    if (progress.courseId) {
                        const course = await Course.findById(progress.courseId);
                        if (course && course.modules) {
                            const moduleDocs = await Module.find({ _id: { $in: course.modules } });
                            for (const mDoc of moduleDocs) {
                                const count = await Lesson.countDocuments({
                                    _id: { $in: mDoc.lessons },
                                    'assignment.title': { $exists: true, $nin: ["", null] }
                                });
                                totalAssignmentsInCourse += count;
                            }
                        }
                    }

                    // 2. Fetch all graded submissions for this learner in this cohort
                    const allSubmissions = await Submission.find({
                        learnerId,
                        cohortId,
                        status: 'graded'
                    });

                    if (totalAssignmentsInCourse > 0) {
                        const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                        // Divide by total possible marks (totalAssignments * 10)
                        progress.currentScore = (totalScore / (totalAssignmentsInCourse * 10)) * 100;

                        if (progress.currentScore < 50) {
                            progress.status = 'failed';
                        } else {
                            if (progress.status === 'failed' || progress.status === 'under-review' || progress.status === 'at-risk') {
                                progress.status = 'on-track';
                            }
                        }
                    }

                    const lesson = await Lesson.findById(lessonId);
                    if (lesson && lesson.moduleId) {
                        let modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                        if (!modProgress) {
                            progress.moduleProgress.push({ moduleId: lesson.moduleId, scores: [], averageScore: 0, isGraduated: false });
                            modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                        }

                        const moduleLessonsWithAssignments = await Lesson.find({
                            moduleId: lesson.moduleId,
                            'assignment.title': { $exists: true, $nin: ["", null] }
                        });
                        const totalAssignmentsInModule = moduleLessonsWithAssignments.length;
                        const lessonIds = moduleLessonsWithAssignments.map(l => l._id);

                        const moduleSubmissions = await Submission.find({
                            learnerId,
                            cohortId,
                            lessonId: { $in: lessonIds },
                            status: 'graded'
                        });

                        if (totalAssignmentsInModule > 0) {
                            const modTotal = moduleSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                            modProgress.averageScore = modTotal / totalAssignmentsInModule;
                            modProgress.scores = moduleSubmissions.map(s => s.grade);
                            modProgress.isGraduated = (modProgress.averageScore * 10) >= 70; // averageScore is out of 10
                        }
                    }

                    if (!progress.completedLessons.includes(lessonId)) {
                        progress.completedLessons.push(lessonId);
                    }

                    await progress.save();
                }
        } else {
            // Update completedLessons array for regular assignments too
            const progress = await LearnerProgress.findOne({ learnerId, cohortId });
            if (progress) {
                if (!progress.completedLessons.includes(lessonId)) {
                    progress.completedLessons.push(lessonId);
                }
                await progress.save();
            }
        }

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

        let query = { learnerId, lessonId };
        if (cohortId) {
            query.cohortId = cohortId;
        }

        let submission = await Submission.findOne(query);

        // Fallback: If cohortId was provided but no submission found, try without cohortId
        if (!submission && cohortId) {
            submission = await Submission.findOne({ learnerId, lessonId });
        }

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
            // 1. Calculate Total Assignments in Course
            let totalAssignmentsInCourse = 0;
            if (progress.courseId) {
                const course = await Course.findById(progress.courseId);
                if (course && course.modules) {
                    const moduleDocs = await Module.find({ _id: { $in: course.modules } });
                    for (const mDoc of moduleDocs) {
                        const count = await Lesson.countDocuments({
                            _id: { $in: mDoc.lessons },
                            'assignment.title': { $exists: true, $nin: ["", null] }
                        });
                        totalAssignmentsInCourse += count;
                    }
                }
            }

            // 2. Fetch all graded submissions for this learner in this cohort
            const allSubmissions = await Submission.find({
                learnerId: submission.learnerId,
                cohortId: submission.cohortId,
                status: 'graded'
            });

            if (totalAssignmentsInCourse > 0) {
                // Calculate average score relative to total assignments
                const totalScore = allSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                
                // Convert to Percentage (Total Score / (Total Assignments * 10) * 100)
                progress.currentScore = (totalScore / (totalAssignmentsInCourse * 10)) * 100;

                // Check for Fail/Pass Status (< 50%)
                if (progress.currentScore < 50) {
                    progress.status = 'failed';
                } else {
                    if (progress.status === 'failed' || progress.status === 'under-review' || progress.status === 'at-risk') {
                        progress.status = 'on-track';
                    }
                }
            }

            // 3. Calculate Module Progress
            const lesson = await Lesson.findById(submission.lessonId);
            if (lesson && lesson.moduleId) {
                let modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                if (!modProgress) {
                    progress.moduleProgress.push({ moduleId: lesson.moduleId, scores: [], averageScore: 0, isGraduated: false });
                    modProgress = progress.moduleProgress.find(mp => mp.moduleId.toString() === lesson.moduleId.toString());
                }

                // Get all lessons in THIS module that have assignments
                const moduleLessonsWithAssignments = await Lesson.find({
                    moduleId: lesson.moduleId,
                    'assignment.title': { $exists: true, $nin: ["", null] }
                });
                const totalAssignmentsInModule = moduleLessonsWithAssignments.length;
                const lessonIds = moduleLessonsWithAssignments.map(l => l._id);

                const moduleSubmissions = await Submission.find({
                    learnerId: submission.learnerId,
                    cohortId: submission.cohortId,
                    lessonId: { $in: lessonIds },
                    status: 'graded'
                });

                if (totalAssignmentsInModule > 0) {
                    const modTotal = moduleSubmissions.reduce((acc, curr) => acc + (curr.grade || 0), 0);
                    modProgress.averageScore = modTotal / totalAssignmentsInModule;
                    modProgress.scores = moduleSubmissions.map(s => s.grade);

                    // Graduation Check (70%)
                    modProgress.isGraduated = (modProgress.averageScore * 10) >= 70;
                }

                if (!progress.completedLessons.includes(submission.lessonId)) {
                    progress.completedLessons.push(submission.lessonId);
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
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};

        // If not admin, restrict to cohorts or courses where the instructor is assigned
        if (role !== 'admin' && role !== 'super-admin') {
            const Cohort = require('../models/Cohort');
            const Course = require('../models/Course');
            const Module = require('../models/Module');
            const Lesson = require('../models/Lesson');

            // 1. Get cohorts where they are assigned as instructor
            const cohorts = await Cohort.find({ instructorIds: userId });
            const cohortIds = cohorts.map(c => c._id);

            // 2. Get courses where they are the instructor
            const courses = await Course.find({ instructorId: userId });
            const courseIds = courses.map(c => c._id);

            // 3. Get all lessons for those courses
            const modules = await Module.find({ courseId: { $in: courseIds } });
            const moduleIds = modules.map(m => m._id);
            const lessons = await Lesson.find({ moduleId: { $in: moduleIds } });
            const lessonIds = lessons.map(l => l._id);

            query = {
                $or: [
                    { cohortId: { $in: cohortIds } },
                    { lessonId: { $in: lessonIds } }
                ]
            };
        }

        const submissions = await Submission.find(query)
            .populate('learnerId', 'firstName lastName email')
            .populate('lessonId', 'name assignment')
            .populate('cohortId', 'name')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

