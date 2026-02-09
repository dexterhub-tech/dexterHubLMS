const Cohort = require('../models/Cohort');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const Course = require('../models/Course');

// Get all cohorts
exports.getAllCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort.find();
        res.json(cohorts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get cohort by ID
exports.getCohortById = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.id).populate('courseIds');
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }
        res.json(cohort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new cohort
exports.createCohort = async (req, res) => {
    try {
        const cohort = new Cohort(req.body);
        await cohort.save();
        res.status(201).json(cohort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get cohort learners with progress
exports.getCohortLearners = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.cohortId);
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }

        const learners = await User.find({ _id: { $in: cohort.learnerIds } });

        const learnersWithProgress = await Promise.all(
            learners.map(async (learner) => {
                const progress = await LearnerProgress.findOne({
                    learnerId: learner._id,
                    cohortId: req.params.cohortId,
                });
                return {
                    ...learner.toObject(),
                    progress: progress || { status: 'on-track', currentScore: 0 },
                };
            })
        );

        res.json(learnersWithProgress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Join a cohort
exports.joinCohort = async (req, res) => {
    try {
        const { cohortId } = req.body;
        const learnerId = req.user.id; // From authMiddleware

        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }

        if (cohort.status !== 'upcoming' && cohort.status !== 'active') {
            return res.status(400).json({ error: 'Cannot join a completed or archived cohort' });
        }

        // Add learner to cohort if not already there
        if (!cohort.learnerIds.includes(learnerId)) {
            cohort.learnerIds.push(learnerId);
            await cohort.save();
        }

        // Handle Progress "Reset" / Archival
        // Find any existing active progress and mark as dropped/archived if migrating
        // For simple logic, we just create a new active progress record for this cohort
        await LearnerProgress.updateMany(
            { learnerId, status: { $in: ['on-track', 'at-risk', 'under-review'] } },
            { $set: { status: 'dropped' } } // Or 'archived' depending on business logic
        );

        // Create new progress record
        const newProgress = new LearnerProgress({
            learnerId,
            cohortId,
            status: 'on-track',
            currentScore: 100, // Start with 100% or 0 depending on philosophy
            learningHoursThisWeek: 0
        });
        await newProgress.save();

        // Update User's active cohort
        await User.findByIdAndUpdate(learnerId, { activeCohortId: cohortId });

        res.json({ message: 'Successfully joined cohort', cohort, progress: newProgress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Apply to a course in a cohort
exports.applyToCourse = async (req, res) => {
    try {
        const { cohortId, courseId, reason } = req.body;
        const learnerId = req.user.id;

        // Check if cohort exists and has the course
        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }

        if (!cohort.courseIds.includes(courseId)) {
            return res.status(400).json({ error: 'Course not found in this cohort' });
        }

        // Check if learner is already in THIS cohort with ANY course
        const existingProgress = await LearnerProgress.findOne({
            learnerId,
            cohortId,
            status: { $ne: 'dropped' },
            courseId: { $exists: true, $ne: null }
        });

        if (existingProgress) {
            return res.status(400).json({ error: 'You are already enrolled in a course in this cohort' });
        }

        // Check if there is already a pending application for THIS cohort
        const pendingApp = await EnrollmentRequest.findOne({
            learnerId,
            cohortId,
            status: 'pending'
        });

        if (pendingApp) {
            return res.status(400).json({ error: 'You already have a pending application for this cohort' });
        }

        const application = new EnrollmentRequest({
            learnerId,
            courseId,
            cohortId,
            reason
        });

        await application.save();
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get learner's own applications
exports.getMyApplications = async (req, res) => {
    try {
        const learnerId = req.user.id;
        const applications = await EnrollmentRequest.find({ learnerId })
            .populate('courseId', 'name description icon color')
            .populate('cohortId', 'name startDate endDate status')
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// List pending applications for instructor/admin
exports.listPendingApplications = async (req, res) => {
    try {
        const query = {};
        // If instructor, only show applications for cohorts they manage
        if (req.user.role === 'instructor') {
            const myCohorts = await Cohort.find({ instructorIds: req.user.id });
            query.cohortId = { $in: myCohorts.map(c => c._id) };
        }

        const applications = await EnrollmentRequest.find({ ...query, status: 'pending' })
            .populate('learnerId', 'firstName lastName email')
            .populate('courseId', 'name')
            .populate('cohortId', 'name');

        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Handle application (approve/reject)
exports.handleApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'approve' or 'reject'

        const application = await EnrollmentRequest.findById(id);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Application is already processed' });
        }

        if (action === 'approve') {
            application.status = 'approved';

            // Enroll the student
            const newProgress = new LearnerProgress({
                learnerId: application.learnerId,
                cohortId: application.cohortId,
                courseId: application.courseId,
                status: 'on-track',
                currentScore: 100,
                learningHoursThisWeek: 0
            });
            await newProgress.save();

            // Add learner to cohort
            await Cohort.findByIdAndUpdate(application.cohortId, {
                $addToSet: { learnerIds: application.learnerId }
            });

            // Set as active cohort if they don't have one
            await User.findByIdAndUpdate(application.learnerId, {
                $set: { activeCohortId: application.cohortId }
            });

            // Add learner to COURSE registrars list
            await Course.findByIdAndUpdate(application.courseId, {
                $addToSet: { registrars: application.learnerId }
            });

        } else if (action === 'reject') {
            application.status = 'rejected';
            application.reason = reason;
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        await application.save();

        res.json({ message: `Application ${action}d successfully`, application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add course to cohort
exports.addCourseToCohort = async (req, res) => {
    try {
        const { cohortId, courseId } = req.params;

        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if course is already in cohort
        if (cohort.courseIds.includes(courseId)) {
            return res.status(400).json({ error: 'Course already in cohort' });
        }

        // Add course to cohort
        cohort.courseIds.push(courseId);
        await cohort.save();

        res.json({ message: 'Course added to cohort successfully', cohort });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove course from cohort
exports.removeCourseFromCohort = async (req, res) => {
    try {
        const { cohortId, courseId } = req.params;

        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({ error: 'Cohort not found' });
        }

        // Remove course from cohort
        cohort.courseIds = cohort.courseIds.filter(id => id.toString() !== courseId);
        await cohort.save();

        res.json({ message: 'Course removed from cohort successfully', cohort });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
