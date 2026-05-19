const Profile = require('../models/Profile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.user.id }).populate('userId', 'firstName lastName email role');
        
        // If profile doesn't exist, create an empty one
        if (!profile) {
            profile = new Profile({ userId: req.user.id });
            await profile.save();
            profile = await profile.populate('userId', 'firstName lastName email role');
        }
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { 
            avatar, bio, title, phoneNumber, location, socialLinks,
            learnerDetails, instructorDetails, adminDetails,
            firstName, lastName
        } = req.body;

        if (firstName || lastName) {
            const userUpdate = {};
            if (firstName !== undefined) userUpdate.firstName = firstName;
            if (lastName !== undefined) userUpdate.lastName = lastName;
            await User.findByIdAndUpdate(req.user.id, userUpdate);
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.user.id },
            {
                avatar,
                bio,
                title,
                phoneNumber,
                location,
                socialLinks,
                learnerDetails,
                instructorDetails,
                adminDetails,
                updatedAt: Date.now()
            },
            { new: true, upsert: true }
        ).populate('userId', 'firstName lastName email role');

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
