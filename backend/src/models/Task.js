const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['assignment', 'quiz', 'video', 'task', 'exam', 'project'], default: 'task' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'overdue'], default: 'pending' },
    dueDate: Date,
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    cohortId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of lesson, event, submission etc.
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
