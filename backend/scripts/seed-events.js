const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cohort = require('../src/models/Cohort');
const Event = require('../src/models/Event');

dotenv.config();

const seedEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let cohort = await Cohort.findOne({ status: 'active' });
        if (!cohort) {
            cohort = await Cohort.findOne({ status: 'upcoming' });
        }
        if (!cohort) {
            cohort = await Cohort.findOne();
        }

        if (!cohort) {
            console.log('No cohort found at all. Creating a temporary test cohort...');
            cohort = new Cohort({
                name: 'Test Induction Cohort',
                description: 'A temporary cohort created for event verification.',
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                status: 'active',
                learnerIds: [],
                instructorIds: [],
                courseIds: []
            });
            await cohort.save();
        }

        console.log(`Adding events to cohort: ${cohort.name} (${cohort._id})`);

        // Clear existing events for this cohort
        await Event.deleteMany({ cohortId: cohort._id });

        const events = [
            {
                title: 'Term Examination',
                description: 'Full-spectrum knowledge assessment for the current module.',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
                duration: '3 Hours',
                type: 'exam',
                cohortId: cohort._id,
                icon: '📝'
            },
            {
                title: 'Project Submission',
                description: 'LMS Core Module implementation submission deadline.',
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
                duration: 'N/A',
                type: 'assignment',
                cohortId: cohort._id,
                icon: '📁'
            },
            {
                title: 'Skills Workshop',
                description: 'Interactive session on advanced UI/UX patterns.',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
                duration: '2 Hours',
                type: 'lecture',
                cohortId: cohort._id,
                icon: '🎬'
            }
        ];

        await Event.insertMany(events);
        console.log('Successfully seeded events!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding events:', error);
        process.exit(1);
    }
};

seedEvents();
