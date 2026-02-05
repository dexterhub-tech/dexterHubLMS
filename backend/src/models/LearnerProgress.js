const mongoose = require('mongoose');

const learnerProgressSchema = new mongoose.Schema({
    learnerId: mongoose.Schema.Types.ObjectId,
    cohortId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
    completedLessons: [mongoose.Schema.Types.ObjectId],
    moduleProgress: [{
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        scores: [Number],
        averageScore: { type: Number, default: 0 },
        isGraduated: { type: Boolean, default: false }
    }],
    currentScore: { type: Number, default: 0 },
    learningHoursThisWeek: { type: Number, default: 0 },
    status: { type: String, enum: ['on-track', 'at-risk', 'under-review', 'dropped'], default: 'on-track' },
    lastActivityDate: Date,
    inactivityDays: { type: Number, default: 0 },
    lastAssessmentDate: Date,
    lastAssessmentScore: Number,
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LearnerProgress', learnerProgressSchema);
