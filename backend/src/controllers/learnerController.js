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
                        'assignment.title': { $exists: true, $nin: ["", null] }
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
                        'assignment.title': { $exists: true, $nin: ["", null] }
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
            // allTasks.push({
            //     id: 'debug-1',
            //     title: `No assignments found for your account`,
            //     subject: 'System Check',
            //     instructor: 'LMS Bot',
            //     type: 'Task',
            //     status: 'pending',
            //     dueDate: new Date().toISOString(),
            //     color: 'yellow',
            //     isLocked: false,
            //     description: `ID: ${learnerId} | Enrollments: ${enrollments.length} | Cohort: ${cohortId}`
            // });
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

        // Calculate hours
        const totalHours = progressRecords.reduce((acc, curr) => acc + (curr.learningHoursThisWeek || 0), 0);

        // Fetch all submissions for the learner
        const allSubmissions = await Submission.find({ learnerId })
            .sort({ submittedAt: 1 })
            .populate({
                path: 'lessonId',
                select: 'title type'
            });

        // 1. Calculate Velocity (Avg grade)
        const gradedSubmissions = allSubmissions.filter(s => s.status === 'graded' && s.grade !== null);
        const velocity = gradedSubmissions.length > 0
            ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length)
            : 0;

        // 2. Calculate Streak
        // Get unique days learner submitted something (in format YYYY-MM-DD)
        const uniqueDays = [...new Set(allSubmissions.map(s => {
            if (!s.submittedAt) return null;
            return new Date(s.submittedAt).toISOString().split('T')[0];
        }).filter(Boolean))].sort().reverse();

        let streak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (uniqueDays.length > 0) {
            if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
                let checkDate = new Date(uniqueDays[0]);
                for (const day of uniqueDays) {
                    if (day === checkDate.toISOString().split('T')[0]) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }

        // 3. Certificates (Number of graduated modules)
        let certificates = 0;
        progressRecords.forEach(pr => {
            if (pr.moduleProgress) {
                certificates += pr.moduleProgress.filter(m => m.isGraduated).length;
            }
        });

        // 4. Formulate Weekly Chart Data (Last 8 weeks)
        const chartData = [];
        const weeksCount = 8;
        const msInWeek = 7 * 24 * 60 * 60 * 1000;
        const nowMs = Date.now();

        for (let i = weeksCount - 1; i >= 0; i--) {
            const weekStartMs = nowMs - (i + 1) * msInWeek;
            const weekEndMs = nowMs - i * msInWeek;

            const weekSubmissions = gradedSubmissions.filter(s => {
                const sTime = new Date(s.submittedAt).getTime();
                return sTime > weekStartMs && sTime <= weekEndMs;
            });

            const weekAvg = weekSubmissions.length > 0
                ? Math.round(weekSubmissions.reduce((sum, s) => sum + s.grade, 0) / weekSubmissions.length)
                : (chartData.length > 0 ? chartData[chartData.length - 1].score : 0); // carry over previous week

            chartData.push({
                week: `W${weeksCount - i}`,
                score: weekAvg
            });
        }

        // 5. Recent Submissions (Assessments)
        const recentSubmissions = [...allSubmissions]
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

        const assessments = recentSubmissions.map(s => ({
            id: s._id,
            name: s.lessonId?.title || 'Untitled Assessment',
            date: s.submittedAt,
            score: s.grade,
            status: s.status === 'graded' ? 'completed' : 'pending',
            type: 'Assignment' // Could map from s.lessonId.type if available
        }));

        res.json({
            stats: {
                velocity,
                hours: totalHours,
                streak,
                certificates
            },
            chartData,
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

// Get grades and review details for learner
exports.getGradesAndReview = async (req, res) => {
    try {
        const learnerId = req.params.learnerId;

        // 1. Find enrollment progress to identify cohort and course (prioritizing actual course enrollment)
        let progress = await LearnerProgress.findOne({
            learnerId,
            courseId: { $ne: null }
        })
        .populate('learnerId', 'firstName lastName email')
        .populate('courseId')
        .populate('cohortId');

        if (!progress) {
            progress = await LearnerProgress.findOne({ learnerId })
                .populate('learnerId', 'firstName lastName email')
                .populate('courseId')
                .populate('cohortId');
        }

        if (!progress) {
            return res.status(404).json({ error: 'Learner progress not found.' });
        }

        const cohortId = progress.cohortId?._id || progress.cohortId;
        const courseId = progress.courseId?._id || progress.courseId;

        // 2. Fetch all assignments in the course (Lessons that have assignments)
        let lessons = [];
        if (courseId) {
            const modules = await Module.find({ courseId });
            const moduleIds = modules.map(m => m._id);
            
            // Gather lesson IDs specified in the lessons array of each module
            let lessonIdsFromModules = [];
            modules.forEach(m => {
                if (m.lessons && Array.isArray(m.lessons)) {
                    lessonIdsFromModules.push(...m.lessons);
                }
            });

            lessons = await Lesson.find({
                $or: [
                    { moduleId: { $in: moduleIds } },
                    { _id: { $in: lessonIdsFromModules } }
                ],
                'assignment.title': { $exists: true, $nin: ["", null] }
            }).populate('moduleId', 'name');
        }

        // 3. Fetch submissions for this learner in this cohort
        const submissions = await Submission.find({
            learnerId,
            cohortId
        }).populate('gradedBy', 'firstName lastName');

        // Create a map of lessonId -> submission for easy lookup
        const submissionMap = {};
        submissions.forEach(sub => {
            submissionMap[sub.lessonId.toString()] = sub;
        });

        // 4. Map lessons to tasks with grades
        const tasks = lessons.map(lesson => {
            const submission = submissionMap[lesson._id.toString()];
            return {
                lessonId: lesson._id,
                title: lesson.assignment.title || lesson.name,
                description: lesson.assignment.description,
                type: lesson.assignment.type || 'task',
                maxScore: lesson.assignment.maxScore || 10,
                moduleName: lesson.moduleId?.name || 'General',
                status: submission ? (submission.status === 'graded' ? 'graded' : 'submitted') : 'pending',
                grade: submission ? submission.grade : null,
                feedback: submission ? submission.feedback : null,
                submittedAt: submission ? submission.submittedAt : null,
                gradedAt: submission ? submission.gradedAt : null,
                gradedBy: submission && submission.gradedBy ? `${submission.gradedBy.firstName} ${submission.gradedBy.lastName}` : null,
                content: submission ? submission.content : null
            };
        });

        // 5. Fetch leaderboard of other learners in that course/cohort
        let leaderboard = [];
        if (cohortId) {
            const cohortProgressList = await LearnerProgress.find({ cohortId })
                .populate('learnerId', 'firstName lastName email avatar')
                .sort({ currentScore: -1 });

                leaderboard = cohortProgressList.map((cp, idx) => ({
                  rank: idx + 1,
                  id: cp.learnerId ? cp.learnerId._id : null,
                  name: cp.learnerId ? `${cp.learnerId.firstName} ${cp.learnerId.lastName}` : 'Unknown Learner',
                  email: cp.learnerId?.email,
                  avatar: cp.learnerId?.avatar,
                  currentScore: Math.round(cp.currentScore || 0),
                  status: cp.status,
                  isCurrentUser: cp.learnerId?._id.toString() === learnerId.toString()
                }));
        }

        // 6. Show grade analytics
        const moduleProgressDetails = [];
        if (progress.moduleProgress && progress.moduleProgress.length > 0) {
            for (const mp of progress.moduleProgress) {
                const mod = await Module.findById(mp.moduleId);
                moduleProgressDetails.push({
                    moduleId: mp.moduleId,
                    moduleName: mod ? mod.name : 'Unknown Module',
                    averageScore: mp.averageScore || 0,
                    scores: mp.scores || [],
                    isGraduated: mp.isGraduated || false
                });
            }
        }

        const gradedTasks = tasks.filter(t => t.status === 'graded');
        const submittedTasks = tasks.filter(t => t.status === 'submitted' || t.status === 'graded');

        // Average grade (out of maxScore, on a 0–10 scale)
        const avgScore = gradedTasks.length > 0
            ? (gradedTasks.reduce((sum, t) => sum + (t.grade || 0), 0) / gradedTasks.length)
            : 0;

        // --- FIX: Calculate real overall score from actual graded submissions ---
        // Use weighted percentage: total points earned / total max points possible
        // This replaces the stale progress.currentScore field which defaults to 100.
        let currentScore = 0;
        if (gradedTasks.length > 0) {
            const totalEarned = gradedTasks.reduce((sum, t) => sum + (t.grade || 0), 0);
            const totalPossible = gradedTasks.reduce((sum, t) => sum + (t.maxScore || 10), 0);
            currentScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        }
        // If no graded tasks yet, show 0% rather than a misleading stored value

        const distribution = { A: 0, B: 0, C: 0, F: 0 };
        gradedTasks.forEach(t => {
            const scorePct = (t.grade / t.maxScore) * 100;
            if (scorePct >= 85) distribution.A++;
            else if (scorePct >= 70) distribution.B++;
            else if (scorePct >= 50) distribution.C++;
            else distribution.F++;
        });

        // 7. Encouragement / Warning message
        let feedbackMessage = '';
        let messageType = 'info';

        if (currentScore >= 85) {
            feedbackMessage = `Excellent work, ${progress.learnerId?.firstName || 'Learner'}! You are performing exceptionally well with a score of ${Math.round(currentScore)}%. Keep up the great work and maintain this momentum!`;
            messageType = 'success';
        } else if (currentScore >= 70) {
            feedbackMessage = `You're doing great! Your current score is ${Math.round(currentScore)}%. A little more focus and consistency will get you to the top tier. Keep going!`;
            messageType = 'success';
        } else if (currentScore >= 50) {
            feedbackMessage = `You are on track with a score of ${Math.round(currentScore)}%, but there is room for improvement. We encourage you to review your instructor's feedback and revise your recent submissions to boost your score.`;
            messageType = 'info';
        } else {
            feedbackMessage = `Warning: Your current score of ${Math.round(currentScore)}% is below the passing threshold of 50%. Please review the feedback on graded assignments, complete any pending tasks immediately, and reach out to your instructor for support.`;
            messageType = 'warning';
        }

        res.json({
            courseName: progress.courseId?.name || 'My Course',
            cohortName: progress.cohortId?.name || 'My Cohort',
            currentScore: Math.round(currentScore),
            status: progress.status,
            analytics: {
                totalTasks: tasks.length,
                submittedTasksCount: submittedTasks.length,
                gradedTasksCount: gradedTasks.length,
                averageGrade: parseFloat(avgScore.toFixed(1)),
                gradeDistribution: distribution,
                moduleProgress: moduleProgressDetails
            },
            feedbackMessage,
            messageType,
            tasks,
            leaderboard
        });

    } catch (error) {
        console.error("Error in getGradesAndReview:", error);
        res.status(500).json({ error: error.message });
    }
};

