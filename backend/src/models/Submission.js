const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cohortId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    content: { type: String, required: true }, // URL or text content
    grade: { type: Number, default: null }, // Null means ungraded
    feedback: String,
    status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Submission', submissionSchema);
