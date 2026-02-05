const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['learner', 'instructor', 'admin', 'super-admin'], required: true },
    status: { type: String, enum: ['active', 'inactive', 'dropped'], default: 'active' },
    activeCohortId: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
