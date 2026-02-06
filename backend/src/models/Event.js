const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: String, // e.g., "45 Minutes", "2 Hours"
        required: true
    },
    type: {
        type: String,
        enum: ['exam', 'assignment', 'test', 'lecture'],
        default: 'assignment'
    },
    cohortId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cohort',
        required: true
    },
    icon: {
        type: String,
        default: '📝'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
