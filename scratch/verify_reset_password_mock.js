const bcrypt = require('bcryptjs');

// Mock User Model
class MockUser {
    constructor(data) {
        Object.assign(this, data);
        this.resetPasswordToken = null;
        this.resetPasswordExpires = null;
    }

    async save() {
        MockUser.savedInstances.push(this);
        return this;
    }
}

MockUser.savedInstances = [];
MockUser.users = [];

MockUser.findOne = async function(query) {
    if (query.email) {
        return MockUser.users.find(u => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    if (query.resetPasswordToken) {
        const token = query.resetPasswordToken;
        const user = MockUser.users.find(u => u.resetPasswordToken === token);
        if (user && query.resetPasswordExpires && query.resetPasswordExpires.$gt) {
            const now = query.resetPasswordExpires.$gt;
            if (user.resetPasswordExpires > now) {
                return user;
            }
        }
        return null;
    }
    return null;
};

// Register Mock User in global require mock or override require for testing
// We can temporarily patch the model cache or directly pass mock objects
const authController = require('../backend/src/controllers/authController');

// Let's swap the Model constructor inside authController with our mock
// We require User model to mock it
const User = require('../backend/src/models/User');

// Override Mongoose Model methods on the actual User model since require caching is active
const originalFindOne = User.findOne;
const originalPrototypeSave = User.prototype.save;

User.findOne = MockUser.findOne;
User.prototype.save = async function() {
    this.constructor.savedInstances = this.constructor.savedInstances || [];
    this.constructor.savedInstances.push(this);
    return this;
};

// Mock the email utility to intercept sent emails
const emailUtil = require('../backend/src/utils/email');
let lastSentEmail = null;
emailUtil.sendEmail = async (options) => {
    lastSentEmail = options;
    return { success: true, simulated: true };
};

const TEST_EMAIL = 'mock_reset@example.com';
const INITIAL_PASSWORD_HASH = '$2a$10$xyzhashedpassword'; // Mocked bcrypt hash

async function runMockVerification() {
    try {
        console.log('--- Initializing Mock DB ---');
        // Setup initial user state
        const testUser = new User({
            firstName: 'Mock',
            lastName: 'User',
            email: TEST_EMAIL,
            password: INITIAL_PASSWORD_HASH,
            role: 'learner',
            status: 'active'
        });
        
        // Add to our list
        MockUser.users = [testUser];
        User.savedInstances = [];

        console.log('Test user created in mock DB.');

        // 1. Test Forgot Password
        console.log('\n1. Testing forgotPassword controller...');
        let forgotResCode = null;
        let forgotResBody = null;

        const forgotReq = {
            body: { email: TEST_EMAIL },
            headers: { origin: 'http://localhost:3000' }
        };
        const forgotRes = {
            status: function(code) {
                forgotResCode = code;
                return this;
            },
            json: function(body) {
                forgotResBody = body;
                return this;
            }
        };

        await authController.forgotPassword(forgotReq, forgotRes);
        console.log('Status Code:', forgotResCode || 200);
        console.log('Body:', forgotResBody);

        if (forgotResCode && forgotResCode !== 200) {
            throw new Error(`Forgot password failed: ${JSON.stringify(forgotResBody)}`);
        }

        // Verify state
        const token = testUser.resetPasswordToken;
        const expiry = testUser.resetPasswordExpires;
        console.log('Token generated:', token);
        console.log('Expiry set:', expiry > Date.now() ? 'Yes (Future)' : 'No');
        console.log('Sent email subject:', lastSentEmail?.subject);
        console.log('Sent email contains token link:', lastSentEmail?.html.includes(token));

        if (!token || !expiry) {
            throw new Error('Forgot password flow failed state verification');
        }

        // 2. Test Reset Password with invalid token
        console.log('\n2. Testing resetPassword with invalid token...');
        let resetInvalidCode = null;
        let resetInvalidBody = null;

        const resetInvalidReq = {
            body: {
                token: 'incorrect-token',
                password: 'newPassword123'
            }
        };
        const resetInvalidRes = {
            status: function(code) {
                resetInvalidCode = code;
                return this;
            },
            json: function(body) {
                resetInvalidBody = body;
                return this;
            }
        };

        await authController.resetPassword(resetInvalidReq, resetInvalidRes);
        console.log('Status Code (Expected 400):', resetInvalidCode);
        console.log('Body:', resetInvalidBody);

        if (resetInvalidCode !== 400) {
            throw new Error('Reset password accepted an invalid token');
        }

        // 3. Test Reset Password with valid token
        console.log('\n3. Testing resetPassword with valid token...');
        let resetValidCode = null;
        let resetValidBody = null;

        const resetValidReq = {
            body: {
                token: token,
                password: 'newPassword123'
            }
        };
        const resetValidRes = {
            status: function(code) {
                resetValidCode = code;
                return this;
            },
            json: function(body) {
                resetValidBody = body;
                return this;
            }
        };

        await authController.resetPassword(resetValidReq, resetValidRes);
        console.log('Status Code (Expected 200/null):', resetValidCode || 200);
        console.log('Body:', resetValidBody);

        if (resetValidCode && resetValidCode !== 200) {
            throw new Error(`Reset password failed: ${JSON.stringify(resetValidBody)}`);
        }

        // Verify updated state
        console.log('Token cleared:', testUser.resetPasswordToken === null);
        console.log('Expiry cleared:', testUser.resetPasswordExpires === null);
        
        // Verify new password is hashed
        const isHashed = await bcrypt.compare('newPassword123', testUser.password);
        console.log('New password correctly hashed and stored:', isHashed);

        if (testUser.resetPasswordToken !== null || testUser.resetPasswordExpires !== null || !isHashed) {
            throw new Error('Reset password flow failed state verification');
        }

        console.log('\n🎉 ALL OFFLINE UNIT TESTS PASSED SUCCESSFULLY!');

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        // Restore original mongoose methods
        User.findOne = originalFindOne;
        User.prototype.save = originalPrototypeSave;
    }
}

runMockVerification();
