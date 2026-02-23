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
            .populate('cohortId', '_id name')
            .sort({ lastActivityDate: -1, updatedAt: -1 });
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
        console.log(`[getLearnerTasks] Fetching tasks for learner: ${learnerId}`);
        // 1. Get Active Cohort for Learner (Prioritize Course Enrollments)
        // Find all active enrollments
        const enrollments = await LearnerProgress.find({
            learnerId,
            courseId: { $ne: null }
        }).populate('courseId');

        console.log(`[getLearnerTasks] Found ${enrollments.length} enrollments (ignored status filter)`);

        // Also check if they are in a cohort generally
        const cohortEnrollment = await LearnerProgress.findOne({
            learnerId,
            courseId: null
        });

        let cohortId = null;
        if (enrollments.length > 0) cohortId = enrollments[0].cohortId;
        else if (cohortEnrollment) cohortId = cohortEnrollment.cohortId;

        console.log(`[getLearnerTasks] cohortId: ${cohortId}`);

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
            color: 'mint',
            isLocked: false
        }));

        // 3. Fetch Events (Cohort Required)
        if (cohortId) {
            const cohort = await Cohort.findById(cohortId);
            if (cohort) {
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
                        color: 'peach',
                        isLocked: false
                    }))
                ];
            }
        }

        // 4. Fetch Course Assignments
        if (enrollments.length > 0) {
            console.log(`[getLearnerTasks] Processing ${enrollments.length} enrollments`);
            for (const enrollment of enrollments) {
                const course = enrollment.courseId;
                if (!course) {
                    console.log(`[getLearnerTasks] enrollment.courseId is null for ${enrollment._id}`);
                    continue;
                }
                console.log(`[getLearnerTasks] Course for enrollment: ${course.name} (${course._id})`);

                const orderedModuleIds = course.modules || [];
                const moduleDocs = await Module.find({ _id: { $in: orderedModuleIds } });

                const moduleMap = {};
                moduleDocs.forEach(m => { moduleMap[m._id.toString()] = m; });
                const modules = orderedModuleIds
                    .map(id => moduleMap[id.toString()])
                    .filter(Boolean);

                console.log(`[getLearnerTasks] Found ${modules.length} modules for course ${course.name}`);

                const moduleCompletionStatus = [];
                for (const module of modules) {
                    const assignmentLessons = await Lesson.find({
                        _id: { $in: module.lessons },
                        'assignment.title': { $exists: true }
                    });

                    if (assignmentLessons.length === 0) {
                        moduleCompletionStatus.push(true);
                        continue;
                    }

                    const submissions = await Submission.find({
                        learnerId,
                        lessonId: { $in: assignmentLessons.map(l => l._id) }
                    });

                    const submittedLessonIds = new Set(submissions.map(s => s.lessonId.toString()));
                    const allSubmitted = assignmentLessons.every(l => submittedLessonIds.has(l._id.toString()));
                    moduleCompletionStatus.push(allSubmitted);
                }

                for (let moduleIdx = 0; moduleIdx < modules.length; moduleIdx++) {
                    const module = modules[moduleIdx];
                    const isModuleLocked = moduleIdx > 0 && !moduleCompletionStatus[moduleIdx - 1];

                    const lessons = await Lesson.find({
                        _id: { $in: module.lessons },
                        'assignment.title': { $exists: true }
                    });

                    console.log(`[getLearnerTasks] Module ${module.name} (locked: ${isModuleLocked}) - found ${lessons.length} lessons`);

                    for (const lesson of lessons) {
                        const submission = await Submission.findOne({
                            learnerId,
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
                            instructor: 'Course',
                            type: 'Assignment',
                            status: status,
                            dueDate: null,
                            color: 'lavender',
                            isLocked: isModuleLocked && status === 'pending',
                            moduleId: module._id,
                            moduleOrder: moduleIdx,
                            moduleName: module.name,
                            lessonId: lesson._id,
                            courseId: course._id
                        });
                    }
                }
            }
        }

        if (allTasks.length === 0) {
            console.log(`[getLearnerTasks] No tasks found for learner ${learnerId}. Adding debug task.`);
            allTasks.push({
                id: 'debug-1',
                title: `No assignments found for your account`,
                subject: 'System Check',
                instructor: 'LMS Bot',
                type: 'Task',
                status: 'pending',
                dueDate: new Date().toISOString(),
                color: 'yellow',
                isLocked: false,
                description: `ID: ${learnerId} | Enrollments: ${enrollments.length} | Cohort: ${cohortId}`
            });
        }

        console.log(`[getLearnerTasks] Returning ${allTasks.length} tasks total`);
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

// Get learner notifications
exports.getLearnerNotifications = async (req, res) => {
    try {
        const learnerId = req.params.learnerId;
        const notifications = [];

        // 1. Get Enrollments to find Cohort
        const enrollments = await LearnerProgress.find({ learnerId }).populate('courseId');
        let cohortId = null;
        if (enrollments.length > 0) cohortId = enrollments[0].cohortId;

        // 2. Fetch Aggregated Data

        // A. Upcoming Events
        if (cohortId) {
            const events = await Event.find({ cohortId }).sort({ date: 1 }).limit(10);
            events.forEach(e => {
                notifications.push({
                    id: `event-${e._id}`,
                    title: e.title,
                    message: `${e.type.toUpperCase()}: ${e.description || 'Upcoming event'}`,
                    type: e.type === 'exam' || e.type === 'test' ? 'warning' : 'info',
                    time: e.date,
                    read: false,
                    link: `/dashboard/events`
                });
            });
        }

        // B. Recent Graded Submissions
        const submissions = await Submission.find({ learnerId, status: 'graded' })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('lessonId');

        submissions.forEach(s => {
            notifications.push({
                id: `sub-${s._id}`,
                title: 'Assignment Graded',
                message: `Your work on "${s.lessonId?.title || 'Assignment'}" has been graded. Score: ${s.grade}/100`,
                type: 'success',
                time: s.updatedAt,
                read: false,
                link: `/dashboard/progress`
            });
        });

        // C. New Assignments Discovery
        for (const enrollment of enrollments) {
            const course = enrollment.courseId;
            if (!course || !course.modules) continue;

            const modules = await Module.find({ _id: { $in: course.modules } });
            for (const module of modules) {
                const lessons = await Lesson.find({
                    _id: { $in: module.lessons },
                    'assignment.title': { $exists: true },
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
                });

                lessons.forEach(l => {
                    notifications.push({
                        id: `assign-${l._id}`,
                        title: 'New Assignment',
                        message: `New assignment available in ${course.name}: ${l.assignment.title}`,
                        type: 'info',
                        time: l.createdAt,
                        read: false,
                        link: `/dashboard/tasks`
                    });
                });
            }
        }

        // Sort by time descending
        notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: error.message });
    }
};
