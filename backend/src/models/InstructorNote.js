const mongoose = require('mongoose');

const instructorNoteSchema = new mongoose.Schema({
    instructorId: mongoose.Schema.Types.ObjectId,
    learnerId: mongoose.Schema.Types.ObjectId,
    cohortId: mongoose.Schema.Types.ObjectId,
    note: String,
    type: { type: String, enum: ['mentoring', 'warning', 'recommendation', 'general'], default: 'general' },
    actionRequired: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InstructorNote', instructorNoteSchema);
