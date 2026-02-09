const mongoose = require('mongoose');
require('dotenv').config();

// Define minimal schemas if models are not easily importable or just require them
const Cohort = require('./src/models/Cohort');
const User = require('./src/models/User');
const EnrollmentRequest = require('./src/models/EnrollmentRequest');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
        console.log("--- Debugging Applications Visibility ---");

        const applications = await EnrollmentRequest.find({ status: 'pending' });
        console.log(`Found ${applications.length} pending applications.`);

        for (const app of applications) {
            console.log(`App ID: ${app._id}, Cohort ID: ${app.cohortId}, Course ID: ${app.courseId}`);
            const cohort = await Cohort.findById(app.cohortId);
            if (cohort) {
                console.log(`  -> Cohort: ${cohort.name} (${cohort._id})`);
                console.log(`  -> Instructor IDs in Cohort: ${JSON.stringify(cohort.instructorIds)}`);
            } else {
                console.log(`  -> Cohort NOT FOUND`);
            }
        }

        const instructors = await User.find({ role: 'instructor' });
        console.log("\n--- Instructors ---");
        instructors.forEach(inst => {
            console.log(`Instructor: ${inst.firstName} ${inst.lastName}, ID: ${inst._id}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
debug();
