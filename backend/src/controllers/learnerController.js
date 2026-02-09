const LearnerProgress = require('../models/LearnerProgress');
const Cohort = require('../models/Cohort');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const Event = require('../models/Event');

// Get learner progress
exports.getLearnerProgress = async (req, res) => {
    try {
        const progress = await LearnerProgress.find({ learnerId: req.params.learnerId })
            .populate('courseId', '_id name')
            .populate('cohortId', '_id name');
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

// Get learner tasks (assignments + custom tasks + events)
exports.getLearnerTasks = async (req, res) => {
    try {
        const learnerId = req.params.learnerId;

        // 1. Get Active Cohort for Learner (Prioritize Course Enrollments)
        // Find all active enrollments
        const enrollments = await LearnerProgress.find({
            learnerId,
            status: { $in: ['on-track', 'at-risk', 'under-review'] },
            courseId: { $ne: null }
        }).populate('courseId');

        // Also check if they are in a cohort generally
        const cohortEnrollment = await LearnerProgress.findOne({
            learnerId,
            status: { $in: ['on-track', 'at-risk', 'under-review'] },
            courseId: null
        });

        let cohortId = null;
        if (enrollments.length > 0) cohortId = enrollments[0].cohortId;
        else if (cohortEnrollment) cohortId = cohortEnrollment.cohortId;

        let allTasks = [];

        // 2. Fetch Ad-hoc Tasks
        const customTasks = await Task.find({
            learnerId,
            status: { $ne: 'completed' }
        }).sort({ dueDate: 1 });

        allTasks = customTasks.map(t => ({
            id: t._id,
            title: t.title,
            subject: 'Personal',
            instructor: 'Self',
            type: 'Task',
            status: t.status,
            dueDate: t.dueDate,
            color: 'mint'
        }));

        if (cohortId) {
            const cohort = await Cohort.findById(cohortId);

            // 3. Fetch Events
            const events = await Event.find({
                cohortId: cohort._id,
                date: { $gte: new Date() } // Upcoming events
            }).sort({ date: 1 });

            allTasks = [
                ...allTasks,
                ...events.map(e => ({
                    id: e._id,
                    title: e.title,
                    subject: 'Cohort Event',
                    instructor: 'Instructor',
                    type: 'Event',
                    status: 'pending',
                    dueDate: e.date,
                    color: 'peach'
                }))
            ];

            // 4. Fetch Course Assignments
            if (enrollments.length > 0) {
                for (const enrollment of enrollments) {
                    const course = enrollment.courseId;
                    if (!course) continue;

                    const modules = await Module.find({ _id: { $in: course.modules } });

                    for (const module of modules) {
                        const lessons = await Lesson.find({
                            _id: { $in: module.lessons },
                            "assignment.title": { $exists: true }
                        });

                        for (const lesson of lessons) {
                            const submission = await Submission.findOne({
                                learnerId,
                                lessonId: lesson._id
                            });

                            let status = 'pending';
                            if (submission) {
                                status = submission.status === 'graded' ? 'completed' : 'submitted';
                            }
                            // Don't show graded/completed in pending list effectively? 
                            // Or show all? The frontend filters. Let's return all.

                            allTasks.push({
                                id: lesson._id,
                                title: lesson.assignment.title,
                                subject: course.name,
                                instructor: 'Course',
                                type: 'Assignment',
                                status: status,
                                dueDate: null, // Assignments often don't have hard dates in this DB schema yet
                                color: 'lavender'
                            });
                        }
                    }
                }
            }
        }

        res.json(allTasks);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get Dashboard Stats (Progress Page)
exports.getLearnerProgressDashboard = async (req, res) => {
    try {
        const learnerId = req.params.learnerId;

        // Fetch progress records
        const progressRecords = await LearnerProgress.find({ learnerId });

        // Calculate velocity (avg score across all records)
        const totalScore = progressRecords.reduce((acc, curr) => acc + (curr.currentScore || 0), 0);
        const avgScore = progressRecords.length ? Math.round(totalScore / progressRecords.length) : 0;

        // Calculate hours
        const totalHours = progressRecords.reduce((acc, curr) => acc + (curr.learningHoursThisWeek || 0), 0);

        // Recent Submissions (Assessments)
        const submissions = await Submission.find({ learnerId })
            .sort({ submittedAt: -1 })
            .limit(5)
            .populate({
                path: 'lessonId',
                select: 'title type'
            });

        const assessments = submissions.map(s => ({
            id: s._id,
            name: s.lessonId?.title || 'Untitled Assessment',
            date: s.submittedAt,
            score: s.grade,
            status: s.status === 'graded' ? 'completed' : 'pending',
            type: 'Assignment' // Could be quiz if lesson type was available
        }));

        res.json({
            stats: {
                velocity: avgScore,
                hours: totalHours,
                streak: 5, // Mock streak for now
                certificates: 0
            },
            chartData: [ // Mock chart data for visualization structure
                { week: 'W1', score: 65 },
                { week: 'W2', score: 68 },
                { week: 'W3', score: 72 },
                { week: 'W4', score: 70 },
                { week: 'W5', score: 75 },
                { week: 'W6', score: 78 },
                { week: 'W7', score: 80 },
                { week: 'W8', score: avgScore }, // Current week
            ],
            assessments
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
