const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    courseId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    duration: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Module', moduleSchema);
