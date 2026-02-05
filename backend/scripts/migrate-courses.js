const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Course = require('../src/models/Course');
const LearnerProgress = require('../src/models/LearnerProgress');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully.');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses to migrate.`);

        const icons = ['💻', '⚛️', '🎨', '🗄️', '📊', '🌐'];
        const colors = ['mint', 'peach', 'lavender', 'yellow'];

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            console.log(`Migrating course: ${course.name} (${course._id})`);

            // Find all learners enrolled in this course
            const progressRecords = await LearnerProgress.find({
                courseId: course._id,
                status: { $in: ['on-track', 'at-risk', 'under-review'] }
            });

            const registrars = [...new Set(progressRecords.map(p => p.learnerId.toString()))];

            course.registrars = registrars;
            course.icon = course.icon || icons[i % icons.length];
            course.color = course.color || colors[i % colors.length];
            course.learnerStatus = 'available'; // Default for model, frontend calculates dynamic status anyway

            await course.save();
            console.log(`Successfully migrated ${course.name}. Registrars: ${registrars.length}`);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
