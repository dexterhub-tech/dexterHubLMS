const mongoose = require('mongoose');

const appealSchema = new mongoose.Schema({
    learnerId: mongoose.Schema.Types.ObjectId,
    cohortId: mongoose.Schema.Types.ObjectId,
    dropRecommendationId: mongoose.Schema.Types.ObjectId,
    reason: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String,
});

module.exports = mongoose.model('Appeal', appealSchema);
