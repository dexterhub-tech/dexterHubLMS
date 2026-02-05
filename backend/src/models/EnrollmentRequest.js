const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    cohortId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);
