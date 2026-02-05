const mongoose = require('mongoose');

const cohortSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'completed', 'archived'], default: 'upcoming' },
    instructorIds: [mongoose.Schema.Types.ObjectId],
    learnerIds: [mongoose.Schema.Types.ObjectId],
    courseIds: [mongoose.Schema.Types.ObjectId],
    performanceThreshold: { type: Number, default: 70 },
    weeklyTarget: { type: Number, default: 10 },
    gracePeriodDays: { type: Number, default: 3 },
    reviewCycleFrequency: { type: String, enum: ['weekly', 'bi-weekly', 'monthly'], default: 'weekly' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cohort', cohortSchema);
