const mongoose = require('mongoose');
const LearnerProgress = require('./backend/src/models/LearnerProgress');
const Course = require('./backend/src/models/Course');
const Module = require('./backend/src/models/Module');
const Lesson = require('./backend/src/models/Lesson');
const User = require('./backend/src/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';

async function diagnose() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const learnerCount = await User.countDocuments({ role: 'learner' });
        console.log(`Total learners: ${learnerCount}`);

        const learners = await User.find({ role: 'learner' }).limit(5);
        for (const learner of learners) {
            console.log(`\nDiagnosing learner: ${learner.firstName} ${learner.lastName} (${learner._id})`);

            const enrollments = await LearnerProgress.find({ learnerId: learner._id });
            console.log(`  Found ${enrollments.length} enrollment records total`);

            for (const e of enrollments) {
                console.log(`  - Enrollment: courseId=${e.courseId}, status=${e.status}`);
                if (e.courseId) {
                    const course = await Course.findById(e.courseId);
                    if (course) {
                        console.log(`    Course found: ${course.name}, Modules: ${course.modules?.length}`);
                        if (course.modules?.length > 0) {
                            const module = await Module.findById(course.modules[0]);
                            if (module) {
                                console.log(`    First module: ${module.name}, Lessons: ${module.lessons?.length}`);
                                if (module.lessons?.length > 0) {
                                    const lessonsWithAssignments = await Lesson.find({
                                        _id: { $in: module.lessons },
                                        'assignment.title': { $exists: true }
                                    });
                                    console.log(`    Lessons with assignments in first module: ${lessonsWithAssignments.length}`);
                                }
                            } else {
                                console.log(`    First module NOT found: ${course.modules[0]}`);
                            }
                        }
                    } else {
                        console.log(`    Course NOT found: ${e.courseId}`);
                    }
                }
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Diagnosis failed:', error);
    }
}

diagnose();
