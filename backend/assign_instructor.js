const mongoose = require('mongoose');
require('dotenv').config();

const Cohort = require('./src/models/Cohort');

async function assign() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');

        const cohortId = '6989f45458116249ebd3da88'; // Batch 1 Intensive Cohort 2026
        const instructorId = '6989f46e58116249ebd3da8c'; // Ayodeji Chiubuzor

        const cohort = await Cohort.findById(cohortId);
        if (!cohort) {
            console.error('Cohort not found');
            return;
        }

        if (!cohort.instructorIds.includes(instructorId)) {
            cohort.instructorIds.push(instructorId);
            await cohort.save();
            console.log(`Instructor ${instructorId} assigned to cohort ${cohort.name}`);
        } else {
            console.log('Instructor already assigned');
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}
assign();
