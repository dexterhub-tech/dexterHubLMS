const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Common Fields
    avatar: String,
    bio: String,
    title: String,
    phoneNumber: String,
    location: String,
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String
    },
    
    // Learner Specific Details
    learnerDetails: {
        learningGoals: [String],
        interests: [String],
        education: String,
        currentOccupation: String
    },
    
    // Instructor Specific Details
    instructorDetails: {
        expertise: [String],
        experienceYears: Number,
        teachingPhilosophy: String,
        achievements: [String]
    },
    
    // Admin Specific Details
    adminDetails: {
        department: String,
        officeHours: String,
        responsibilities: [String]
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

profileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Profile', profileSchema);
