const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    duration: Number,
    icon: { type: String, default: '📚' },
    color: { type: String, default: 'lavender' },
    learnerStatus: { type: String, default: 'available' },
    registrars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);
