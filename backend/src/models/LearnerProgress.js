const mongoose = require('mongoose');

const learnerProgressSchema = new mongoose.Schema({
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cohortId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedLessons: [mongoose.Schema.Types.ObjectId],
    moduleProgress: [{
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        scores: [Number],
        averageScore: { type: Number, default: 0 },
        isGraduated: { type: Boolean, default: false }
    }],
    currentScore: { type: Number, default: 0 },
    learningHoursThisWeek: { type: Number, default: 0 },
    status: { type: String, enum: ['on-track', 'at-risk', 'under-review', 'dropped', 'failed'], default: 'on-track' },
    lastActivityDate: Date,
    inactivityDays: { type: Number, default: 0 },
    lastAssessmentDate: Date,
    lastAssessmentScore: Number,
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LearnerProgress', learnerProgressSchema);
