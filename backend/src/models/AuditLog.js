const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actor: mongoose.Schema.Types.ObjectId,
    action: String,
    targetUser: mongoose.Schema.Types.ObjectId,
    targetCohort: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
