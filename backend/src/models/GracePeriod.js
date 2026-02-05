const mongoose = require('mongoose');

const gracePeriodSchema = new mongoose.Schema({
    learnerId: mongoose.Schema.Types.ObjectId,
    cohortId: mongoose.Schema.Types.ObjectId,
    grantedBy: mongoose.Schema.Types.ObjectId,
    reason: String,
    extensionDays: { type: Number, default: 3 },
    originalDeadline: Date,
    newDeadline: Date,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
});

module.exports = mongoose.model('GracePeriod', gracePeriodSchema);
