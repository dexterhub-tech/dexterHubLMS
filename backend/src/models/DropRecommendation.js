const mongoose = require('mongoose');

const dropRecommendationSchema = new mongoose.Schema({
    learnerId: mongoose.Schema.Types.ObjectId,
    cohortId: mongoose.Schema.Types.ObjectId,
    instructorId: mongoose.Schema.Types.ObjectId,
    reason: String,
    evidence: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'appealed'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String,
});

module.exports = mongoose.model('DropRecommendation', dropRecommendationSchema);
