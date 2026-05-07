const InstructorNote = require('../models/InstructorNote');
const DropRecommendation = require('../models/DropRecommendation');
const Cohort = require('../models/Cohort');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');

// Get all learners across cohorts managed by the instructor
exports.getInstructorLearners = async (req, res) => {
    try {
        const instructorId = req.user.id;
        const isAdmin = ['admin', 'super-admin'].includes(req.user.role);

        console.log(`[getInstructorLearners] Fetching for user: ${instructorId}, role: ${req.user.role}`);

        // 1. Find cohorts and courses associated with the instructor
        let cohortIds = [];
        let targetLearnerIds = [];

        if (isAdmin) {
            const cohorts = await Cohort.find({});
            cohortIds = cohorts.map(c => c._id);
            targetLearnerIds = [...new Set(cohorts.flatMap(c => (c.learnerIds || []).map(id => id.toString())))];
            console.log(`[getInstructorLearners] Admin mode: Found ${targetLearnerIds.length} total learners across all cohorts`);
        } else {
            const mongoose = require('mongoose');
            const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
            const Course = require('../models/Course');
            const EnrollmentRequest = require('../models/EnrollmentRequest');

            // Find all courses taught by this instructor
            const myCourses = await Course.find({ instructorId: instructorObjectId }).select('_id');
            const myCourseIds = myCourses.map(c => c._id);

            // Find all approved enrollment requests for these courses
            const approvedRequests = await EnrollmentRequest.find({
                courseId: { $in: myCourseIds },
                status: 'approved'
            }).select('learnerId cohortId');

            targetLearnerIds = [...new Set(approvedRequests.map(r => r.learnerId.toString()))];
            cohortIds = [...new Set(approvedRequests.map(r => r.cohortId.toString()))];

            console.log(`[getInstructorLearners] Instructor owns ${myCourseIds.length} courses`);
            console.log(`[getInstructorLearners] Found ${targetLearnerIds.length} learners with approved enrollment in instructor's courses`);
        }

        if (targetLearnerIds.length === 0) {
            return res.json([]);
        }

        const learners = await User.find({ _id: { $in: targetLearnerIds } })
            .select('firstName lastName email');
        
        console.log(`[getInstructorLearners] User records found: ${learners.length}`);

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
                cohortId: activeProgress?.cohortId || cohortIds[0] // Fallback to first cohort if no progress
            };
        }));

        console.log(`[getInstructorLearners] Returning ${learnersWithStatus.length} enhanced learner records`);
        res.json(learnersWithStatus);
    } catch (error) {
        console.error(`[getInstructorLearners] ERROR:`, error);
        res.status(500).json({ error: error.message });
    }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const instructorId = req.user.id;
        // 1. Find cohorts managed by the instructor
        const query = {};
        const isAdmin = ['admin', 'super-admin'].includes(req.user.role);
        
        if (!isAdmin && req.user.role === 'instructor') {
            query.instructorIds = instructorId;
        }
        
        const cohorts = await Cohort.find(query);
        const cohortIds = cohorts.map(c => c._id);

        // 2. Total Students Count
        const uniqueLearnerIds = [...new Set(cohorts.flatMap(c =>
            (c.learnerIds || []).map(id => id.toString())
        ))];

        // 3. Growth Data (Last 12 months)
        const EnrollmentRequest = require('../models/EnrollmentRequest');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthData = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[date.getMonth()];
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

            const count = await EnrollmentRequest.countDocuments({
                cohortId: { $in: cohortIds },
                status: 'approved',
                reviewedAt: { $gte: startOfMonth, $lte: endOfMonth }
            });

            growthData.push({ name: monthName, students: count });
        }

        // 4. Recent Activities
        const Submission = require('../models/Submission');
        const recentSubmissions = await Submission.find({ cohortId: { $in: cohortIds } })
            .populate('learnerId', 'firstName lastName')
            .populate('lessonId', 'name')
            .sort({ submittedAt: -1 })
            .limit(5);

        const activities = recentSubmissions.map(s => ({
            title: 'New Assignment Submission',
            sub: `${s.learnerId?.firstName} submitted "${s.lessonId?.name}"`,
            time: s.submittedAt
        }));

        // Add enrollment requests to activities
        const pendingRequests = await EnrollmentRequest.find({
            cohortId: { $in: cohortIds },
            status: 'pending'
        })
            .populate('learnerId', 'firstName lastName')
            .populate('courseId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        activities.push(...pendingRequests.map(r => ({
            title: 'New Enrollment Request',
            sub: `${r.learnerId?.firstName} applied for "${r.courseId?.name}"`,
            time: r.createdAt
        })));

        // Sort activities by time descendently
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        // 5. Avg Completion (Calculated from LearnerProgress)
        const progressRecords = await LearnerProgress.find({ cohortId: { $in: cohortIds } });
        const totalScore = progressRecords.reduce((acc, curr) => acc + (curr.currentScore || 0), 0);
        const avgCompletion = progressRecords.length > 0 ? Math.round(totalScore / progressRecords.length) : 0;

        res.json({
            stats: {
                totalStudents: uniqueLearnerIds.length,
                activeCohorts: cohorts.filter(c => c.status === 'active').length,
                avgCompletion: avgCompletion
            },
            growthData,
            activities: activities.slice(0, 5) // Keep top 5
        });
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
