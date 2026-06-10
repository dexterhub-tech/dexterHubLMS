const mongoose = require('mongoose');

// Mock Models
class MockUser {
    constructor(data) {
        Object.assign(this, data);
    }
}
MockUser.users = [];
MockUser.findById = async (id) => MockUser.users.find(u => u._id.toString() === id.toString()) || null;
MockUser.findByIdAndUpdate = async (id, update) => {
    const user = await MockUser.findById(id);
    if (user && update.$set) {
        Object.assign(user, update.$set);
    } else if (user) {
        Object.assign(user, update);
    }
    return user;
};

class MockCohort {
    constructor(data) {
        Object.assign(this, data);
    }
}
MockCohort.cohorts = [];
MockCohort.findById = async (id) => MockCohort.cohorts.find(c => c._id.toString() === id.toString()) || null;
MockCohort.findByIdAndUpdate = async (id, update) => {
    const cohort = await MockCohort.findById(id);
    if (!cohort) return null;
    
    if (update.$pull && update.$pull.learnerIds) {
        cohort.learnerIds = cohort.learnerIds.filter(lid => lid.toString() !== update.$pull.learnerIds.toString());
    }
    if (update.$addToSet && update.$addToSet.learnerIds) {
        const lid = update.$addToSet.learnerIds;
        if (!cohort.learnerIds.some(item => item.toString() === lid.toString())) {
            cohort.learnerIds.push(lid);
        }
    }
    return cohort;
};

class MockCourse {
    constructor(data) {
        Object.assign(this, data);
    }
}
MockCourse.courses = [];
MockCourse.findById = async (id) => MockCourse.courses.find(c => c._id.toString() === id.toString()) || null;
MockCourse.findByIdAndUpdate = async (id, update) => {
    const course = await MockCourse.findById(id);
    if (!course) return null;

    if (update.$pull && update.$pull.registrars) {
        course.registrars = course.registrars.filter(rid => rid.toString() !== update.$pull.registrars.toString());
    }
    if (update.$addToSet && update.$addToSet.registrars) {
        const rid = update.$addToSet.registrars;
        if (!course.registrars.some(item => item.toString() === rid.toString())) {
            course.registrars.push(rid);
        }
    }
    return course;
};

class MockLearnerProgress {
    constructor(data) {
        Object.assign(this, data);
    }
    async save() {
        MockLearnerProgress.progressRecords.push(this);
        return this;
    }
}
MockLearnerProgress.progressRecords = [];
MockLearnerProgress.findOne = async (query) => {
    return MockLearnerProgress.progressRecords.find(p => 
        p.learnerId.toString() === query.learnerId.toString() &&
        p.cohortId.toString() === query.cohortId.toString() &&
        p.courseId.toString() === query.courseId.toString()
    ) || null;
};
MockLearnerProgress.updateMany = async (query, update) => {
    let count = 0;
    MockLearnerProgress.progressRecords.forEach(p => {
        if (
            p.learnerId.toString() === query.learnerId.toString() &&
            p.cohortId.toString() === query.cohortId.toString() &&
            p.courseId.toString() === query.courseId.toString() &&
            p.status !== 'dropped'
        ) {
            if (update.$set) Object.assign(p, update.$set);
            count++;
        }
    });
    return { modifiedCount: count };
};

class MockAuditLog {
    constructor(data) {
        Object.assign(this, data);
    }
    async save() {
        MockAuditLog.logs.push(this);
        return this;
    }
}
MockAuditLog.logs = [];

// Intercept Mongoose Models inside the adminController
const User = require('../backend/src/models/User');
const Cohort = require('../backend/src/models/Cohort');
const Course = require('../backend/src/models/Course');
const LearnerProgress = require('../backend/src/models/LearnerProgress');
const AuditLog = require('../backend/src/models/AuditLog');

const originalUserFindById = User.findById;
const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;
const originalCohortFindById = Cohort.findById;
const originalCohortFindByIdAndUpdate = Cohort.findByIdAndUpdate;
const originalCourseFindById = Course.findById;
const originalCourseFindByIdAndUpdate = Course.findByIdAndUpdate;
const originalProgressFindOne = LearnerProgress.findOne;
const originalProgressUpdateMany = LearnerProgress.updateMany;
const originalProgressPrototypeSave = LearnerProgress.prototype.save;
const originalAuditLogPrototypeSave = AuditLog.prototype.save;

// Override Mongoose methods
User.findById = MockUser.findById;
User.findByIdAndUpdate = MockUser.findByIdAndUpdate;
Cohort.findById = MockCohort.findById;
Cohort.findByIdAndUpdate = MockCohort.findByIdAndUpdate;
Course.findById = MockCourse.findById;
Course.findByIdAndUpdate = MockCourse.findByIdAndUpdate;
LearnerProgress.findOne = MockLearnerProgress.findOne;
LearnerProgress.updateMany = MockLearnerProgress.updateMany;
LearnerProgress.prototype.save = MockLearnerProgress.prototype.save;
AuditLog.prototype.save = MockAuditLog.prototype.save;

// Load Controller
const adminController = require('../backend/src/controllers/adminController');

async function testTransfer() {
    try {
        console.log('--- Setting up Mock DB Data ---');
        const learnerId = new mongoose.Types.ObjectId();
        const fromCohortId = new mongoose.Types.ObjectId();
        const toCohortId = new mongoose.Types.ObjectId();
        const fromCourseId = new mongoose.Types.ObjectId();
        const toCourseId = new mongoose.Types.ObjectId();
        const adminId = new mongoose.Types.ObjectId();

        const testLearner = new User({
            _id: learnerId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            activeCohortId: fromCohortId
        });
        MockUser.users = [testLearner];

        const testFromCourse = new Course({
            _id: fromCourseId,
            name: 'Course A',
            registrars: [learnerId]
        });
        const testToCourse = new Course({
            _id: toCourseId,
            name: 'Course B',
            registrars: []
        });
        MockCourse.courses = [testFromCourse, testToCourse];

        const testFromCohort = new Cohort({
            _id: fromCohortId,
            name: 'Cohort A',
            courseIds: [fromCourseId],
            learnerIds: [learnerId]
        });
        const testToCohort = new Cohort({
            _id: toCohortId,
            name: 'Cohort B',
            courseIds: [toCourseId],
            learnerIds: []
        });
        MockCohort.cohorts = [testFromCohort, testToCohort];

        const initialProgress = new LearnerProgress({
            learnerId,
            cohortId: fromCohortId,
            courseId: fromCourseId,
            status: 'on-track'
        });
        MockLearnerProgress.progressRecords = [initialProgress];
        MockAuditLog.logs = [];

        console.log('Data initialized successfully.');
        console.log('Active Cohort:', testLearner.activeCohortId);
        console.log('Cohort A learners:', testFromCohort.learnerIds.length);
        console.log('Cohort B learners:', testToCohort.learnerIds.length);
        console.log('Course A registrars:', testFromCourse.registrars.length);
        console.log('Course B registrars:', testToCourse.registrars.length);

        console.log('\n--- Running transferLearner controller ---');
        let resCode = null;
        let resBody = null;

        const req = {
            body: {
                learnerId,
                fromCohortId,
                fromCourseId,
                toCohortId,
                toCourseId
            },
            user: { id: adminId, role: 'admin' }
        };
        const res = {
            status: function(code) {
                resCode = code;
                return this;
            },
            json: function(body) {
                resBody = body;
                return this;
            }
        };

        await adminController.transferLearner(req, res);
        console.log('Response Status:', resCode || 200);
        console.log('Response Message:', resBody?.message);

        if (resCode && resCode !== 200) {
            throw new Error(`Controller failed with status ${resCode}: ${JSON.stringify(resBody)}`);
        }

        // Assertions
        console.log('\n--- Running Assertions ---');
        console.log('1. Old Progress status dropped:', initialProgress.status === 'dropped');
        console.log('2. New Progress created:', MockLearnerProgress.progressRecords.length === 2);
        console.log('3. New Progress status on-track:', MockLearnerProgress.progressRecords[1].status === 'on-track');
        console.log('4. Learner removed from Course A:', !testFromCourse.registrars.some(id => id.toString() === learnerId.toString()));
        console.log('5. Learner added to Course B:', testToCourse.registrars.some(id => id.toString() === learnerId.toString()));
        console.log('6. Learner removed from Cohort A:', !testFromCohort.learnerIds.some(id => id.toString() === learnerId.toString()));
        console.log('7. Learner added to Cohort B:', testToCohort.learnerIds.some(id => id.toString() === learnerId.toString()));
        console.log('8. User activeCohortId updated to Cohort B:', testLearner.activeCohortId.toString() === toCohortId.toString());
        console.log('9. Audit Log created:', MockAuditLog.logs.length === 1);
        console.log('10. Audit Log action is correct:', MockAuditLog.logs[0]?.action === 'transfer_learner');

        const success = (
            initialProgress.status === 'dropped' &&
            MockLearnerProgress.progressRecords.length === 2 &&
            MockLearnerProgress.progressRecords[1].status === 'on-track' &&
            !testFromCourse.registrars.some(id => id.toString() === learnerId.toString()) &&
            testToCourse.registrars.some(id => id.toString() === learnerId.toString()) &&
            !testFromCohort.learnerIds.some(id => id.toString() === learnerId.toString()) &&
            testToCohort.learnerIds.some(id => id.toString() === learnerId.toString()) &&
            testLearner.activeCohortId.toString() === toCohortId.toString() &&
            MockAuditLog.logs.length === 1 &&
            MockAuditLog.logs[0]?.action === 'transfer_learner'
        );

        if (success) {
            console.log('\n🎉 ALL OFFLINE TRANSFER STUDENT UNIT TESTS PASSED!');
        } else {
            throw new Error('Some assertions failed.');
        }

    } catch (err) {
        console.error('❌ Transfer unit test failed:', err);
    } finally {
        // Restore mongoose original methods
        User.findById = originalUserFindById;
        User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
        Cohort.findById = originalCohortFindById;
        Cohort.findByIdAndUpdate = originalCohortFindByIdAndUpdate;
        Course.findById = originalCourseFindById;
        Course.findByIdAndUpdate = originalCourseFindByIdAndUpdate;
        LearnerProgress.findOne = originalProgressFindOne;
        LearnerProgress.updateMany = originalProgressUpdateMany;
        LearnerProgress.prototype.save = originalProgressPrototypeSave;
        AuditLog.prototype.save = originalAuditLogPrototypeSave;
    }
}

testTransfer();
