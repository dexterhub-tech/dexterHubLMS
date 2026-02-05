const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    moduleId: mongoose.Schema.Types.ObjectId,
    name: String,
    content: String,
    videoUrl: String,
    assignment: {
        title: String,
        description: String,
        type: {
            type: String,
            enum: ['task', 'quiz', 'video'],
            default: 'task'
        },
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }],
        maxScore: { type: Number, default: 100 }
    },
    duration: Number,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lesson', lessonSchema);
